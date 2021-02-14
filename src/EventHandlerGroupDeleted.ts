import { Account, Book, Group } from "bkper";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupDeleted extends EventHandlerGroup {

  // parent >> child
  async childGroupNotFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD GROUP ${parentGroup.name} NOT Found`;
  }
  async childGroupFound(parentBook: Book, childBook: Book, parentGroup: bkper.Group, childGroup: Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(childBook);
    await childGroup.remove();
    return `${bookAnchor}: CHILD GROUP ${childGroup.getName()} DELETED`;
  }


  // child >> parent
  async parentAccountNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: PARENT ACCOUNT ${childGroup.name} NOT Found`;
  }
  async parentAccountFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentAccount: Account): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    if (parentAccount.hasTransactionPosted()) {
      await parentAccount.remove();
      return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} DELETED`;
    } else {
      await parentAccount.setArchived(true).update();
      return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} ARCHIVED`;
    }
  }

  async parentGroupNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: PARENT GROUP ${childGroup.name} NOT Found`;
  }
  async parentGroupFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentGroup: Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    await parentGroup.remove();
    return `${bookAnchor}: PARENT GROUP ${parentGroup.getName()} DELETED`;
  }

}