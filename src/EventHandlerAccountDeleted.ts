import { Account, Book } from "bkper";
import { EventHandlerAccount } from "./EventHandlerAccount";

export class EventHandlerAccountDeleted extends EventHandlerAccount {

  protected async parentAccountNotFound(childBook: Book, parentBook: Book, childAccount: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${childAccount.name} NOT Found`;
  }
  protected async parentAccountFound(childBook: Book, parentBook: Book, childAccount: bkper.Account, parentAccount: Account): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    if (parentAccount.hasTransactionPosted()) {
      await parentAccount.remove();
      return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} DELETED`;
    } else {
      await parentAccount.setArchived(true).update();
      return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} ARCHIVED`;
    }
  }
}
