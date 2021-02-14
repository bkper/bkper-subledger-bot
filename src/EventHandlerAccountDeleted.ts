import { Account, Book } from "bkper";
import { EventHandlerAccount } from "./EventHandlerAccount";

export class EventHandlerAccountDeleted extends EventHandlerAccount {

  // parent >> child
  async childAccountNotFound(parentBook: Book, childBook: Book, parentAccount: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD ACCOUNT ${parentAccount.name} NOT Found`;
  }
  async childAccountFound(parentBook: Book, childBook: Book, parentAccount: bkper.Account, childAccount: Account): Promise<string> {
    let bookAnchor = super.buildBookAnchor(childBook);
    if (childAccount.hasTransactionPosted()) {
      await childAccount.remove();
      return `${bookAnchor}: CHILD ACCOUNT ${childAccount.getName()} DELETED`;
    } else {
      await childAccount.setArchived(true).update();
      return `${bookAnchor}: CHILD ACCOUNT ${childAccount.getName()} ARCHIVED`;
    }
  }


  // child >> parent
  async parentAccountNotFound(childBook: Book, parentBook: Book, childAccount: Account): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: PARENT ACCOUNT ${childAccount.getName()} NOT Found`;
  }
  async parentAccountFound(childBook: Book, parentBook: Book, childAccount: Account, parentAccount: Account): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    if (parentAccount.hasTransactionPosted()) {
      await parentAccount.remove();
      return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} DELETED`;
    } else {
      await parentAccount.setArchived(true).update();
      return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} ARCHIVED`;
    }
  }
}
