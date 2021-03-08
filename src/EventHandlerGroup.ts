import { Account, AccountType, Bkper, Book, Group } from "bkper";
import { CHILD_BOOK_ID_PROP, PARENT_ACCOUNT_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerGroup extends EventHandler {

  //parent >> child
  protected abstract childGroupNotFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group): Promise<string>;
  protected abstract childGroupFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group, childGroup: Group): Promise<string>;

  async processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string> {

    let parentGroup = event.data.object as bkper.Group;
    let childBook = await this.getChildBook(parentGroup);

    if (childBook == null) {
      return null;
    }

    let childGroup = await childBook.getGroup(parentGroup.name);

    if (childGroup == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
      childGroup = await childBook.getGroup(event.data.previousAttributes['name']);
    }

    try {

      if (childGroup) {
        return await this.childGroupFound(parentBook, childBook, parentGroup, childGroup);
      } else {
        return await this.childGroupNotFound(parentBook, childBook, parentGroup);
      }

    } catch (err) {
      throw `Failed to handle group ${parentGroup.name} event: ${err}`;
    }

  }

  private async getChildBook(parentGroup: bkper.Group): Promise<Book> {
    if (parentGroup.properties[CHILD_BOOK_ID_PROP]) {
      return Bkper.getBook(parentGroup.properties[CHILD_BOOK_ID_PROP]);
    }
    return null;
  }



  // child >> parent
  protected abstract parentAccountNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string>;
  protected abstract parentAccountFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentAccount: Account): Promise<string>;
  protected abstract parentGroupFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentGroup: Group): Promise<string>;
  
  protected async processChildBookEvent(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {

    let childGroup = event.data.object as bkper.Group;

    const parentAccountName = childGroup.properties[PARENT_ACCOUNT_PROP];
    if (parentAccountName) {
      let parentAccount = await parentBook.getAccount(parentAccountName);
      if (parentAccount == null && (event.data.previousAttributes && event.data.previousAttributes[PARENT_ACCOUNT_PROP])) {
        parentAccount = await parentBook.getAccount(event.data.previousAttributes[PARENT_ACCOUNT_PROP]);
      }
      if (parentAccount) {
        return await this.parentAccountFound(childBook, parentBook, childGroup, parentAccount);
      } else {
        return await this.parentAccountNotFound(childBook, parentBook, childGroup);
      }
    } else {
      // let parentGroup = await this.getLinkedParentGroupFromEvent(childBook, parentBook, childGroup, event);

      // if (parentGroup) {
      //   return await this.parentGroupFound(childBook, parentBook, childGroup, parentGroup)
      // } else {
      //   return null;
      // }

    }
    return null;
  }

  // private async getLinkedParentGroupFromEvent(childBook: Book, parentBook: Book, childGroup: bkper.Group, event: bkper.Event): Promise<Group> {
  //   let parentGroup = await parentBook.getGroup(childGroup.name);

  //   if (parentGroup == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
  //     parentGroup = await childBook.getGroup(event.data.previousAttributes['name']);
  //   }

  //   if (parentGroup && parentGroup.getProperty(CHILD_BOOK_ID_PROP) == childBook.getId()) {
  //     return parentGroup;
  //   }
  //   return null;
  // }

  protected async getChildGroupAccountType(childBook: Book, childGroup: bkper.Group): Promise<AccountType> {
    let group = await childBook.getGroup(childGroup.id);
    return super.getGroupAccountType(group);
  }

}