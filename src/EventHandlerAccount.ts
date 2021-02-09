import { Account, Bkper, Book } from "bkper";
import { CHILD_BOOK_ID_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerAccount extends EventHandler {

  protected async processObject(baseBook: Book, connectedBook: Book, event: bkper.Event): Promise<string> {
    let baseAccount = event.data.object as bkper.Account;

    if (connectedBook == null) {
      connectedBook = await this.getConnectedBook(baseBook, baseAccount);
    }

    if (connectedBook == null) {
      return null;
    }

    let connectedAccount = await connectedBook.getAccount(baseAccount.name);

    if (connectedAccount == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
      connectedAccount = await connectedBook.getAccount(event.data.previousAttributes['name']);
    }

    if (connectedAccount) {
      return await this.connectedAccountFound(baseBook, connectedBook, baseAccount, connectedAccount);
    } else {
      return await this.connectedAccountNotFound(baseBook, connectedBook, baseAccount);
    }

  }

  private async getConnectedBook(baseBook: Book, baseAccount: bkper.Account): Promise<Book> {
    if (baseAccount.groups) {
      for (const groupId of baseAccount.groups) {
        let group = await baseBook.getGroup(groupId);
        if (group.getProperty(CHILD_BOOK_ID_PROP)) {
          return Bkper.getBook(group.getProperty(CHILD_BOOK_ID_PROP));
        }
      }
    }
    return null;
  }

  protected abstract connectedAccountNotFound(baseBook: Book, connectedBook: Book, account: bkper.Account): Promise<string>;

  protected abstract connectedAccountFound(baseBook: Book, connectedBook: Book, account: bkper.Account, connectedAccount: Account): Promise<string>;

}