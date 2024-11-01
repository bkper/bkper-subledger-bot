import { Account, Book, Group } from "bkper-js";
import { CHILD_BOOK_ID_PROP, PARENT_ACCOUNT_PROP } from "./constants.js";
import { EventHandlerGroup } from "./EventHandlerGroup.js";

export class EventHandlerGroupCreatedOrUpdated extends EventHandlerGroup {

  // parent >> child
  protected async childGroupNotFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group): Promise<string> {
    console.log(`CREATE: ${parentGroup.name}`)
    let childGroup = await new Group(childBook)
      .setName(parentGroup.name)
      .setProperties(parentGroup.properties)
      .deleteProperty(CHILD_BOOK_ID_PROP)
      .create();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD GROUP ${childGroup.getName()} CREATED`;
  }
  
  protected async childGroupFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group, childGroup: Group): Promise<string> {
    console.log(`UPDATE: ${parentGroup.name}`)
    await childGroup
      .setName(parentGroup.name)
      .setProperties(parentGroup.properties)
      .deleteProperty(CHILD_BOOK_ID_PROP)
      .update();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD GROUP ${childGroup.getName()} UPDATED`;
  }



  // child >> parent

  protected async parentAccountNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string> {
    console.log(`CREATE: ${childGroup.properties[PARENT_ACCOUNT_PROP]}`)
    let parentAccount = await new Account(parentBook)
      .setName(childGroup.properties[PARENT_ACCOUNT_PROP])
      .setType(await this.getChildGroupAccountType(childBook, childGroup))
      .create();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} CREATED`;
  }
  async parentAccountFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentAccount: Account): Promise<string> {
    console.log(`UPDATE: ${childGroup.properties[PARENT_ACCOUNT_PROP]}`)
    await parentAccount
      .setName(childGroup.properties[PARENT_ACCOUNT_PROP])
      .setType(await this.getChildGroupAccountType(childBook, childGroup))
      .update();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} UPDATED`;
  }

  // async parentGroupFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentGroup: Group): Promise<string> {
  //   let parentGroupChildBookId = parentGroup.getProperty(CHILD_BOOK_ID_PROP)
  //   console.log(`UPDATE: ${childGroup.name}`)
  //   await parentGroup
  //     .setName(childGroup.name)
  //     .setProperties(childGroup.properties)
  //     .setProperty(CHILD_BOOK_ID_PROP, parentGroupChildBookId)
  //     .update();
  //   let bookAnchor = super.buildBookAnchor(parentBook);
  //   return `${bookAnchor}: PARENT GROUP ${parentGroup.getName()} UPDATED`;
  // }

}