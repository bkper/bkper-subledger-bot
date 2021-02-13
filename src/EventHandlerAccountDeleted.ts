import { Account, Book } from "bkper";
import { EventHandlerAccount } from "./EventHandlerAccount";

export class EventHandlerAccountDeleted extends EventHandlerAccount {

  protected async childAccountNotFound(baseBook: Book, connectedBook: Book, baseAccount: bkper.Group): Promise<string> {
    let bookAnchor = super.buildBookAnchor(connectedBook);
    return `${bookAnchor}: CHILD ACCOUNT ${baseAccount.name} NOT Found`;
  }
  protected async childAccountFound(baseBook: Book, connectedBook: Book, baseAccount: bkper.Account, connectedAccount: Account): Promise<string> {
    let bookAnchor = super.buildBookAnchor(connectedBook);
    if (connectedAccount.hasTransactionPosted()) {
      await connectedAccount.remove();
      return `${bookAnchor}: CHILD ACCOUNT ${connectedAccount.getName()} DELETED`;
    } else {
      await connectedAccount.setArchived(true).update();
      return `${bookAnchor}: CHILD ACCOUNT ${connectedAccount.getName()} ARCHIVED`;
    }
  }
}
