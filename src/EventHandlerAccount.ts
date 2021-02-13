import { Account, Bkper, Book } from "bkper";
import { CHILD_BOOK_ID_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerAccount extends EventHandler {


  protected async processChildBookEvent(parentBook: Book, childBook: Book, event: bkper.Event): Promise<string> {
    return null;
  }

  async processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string> {
    let parentAccount = event.data.object as bkper.Account;

    let childBook = await this.getChildBook(parentBook, parentAccount);

    if (childBook == null) {
      return null;
    }

    let childAccount = await childBook.getAccount(parentAccount.name);

    if (childAccount == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
      childAccount = await childBook.getAccount(event.data.previousAttributes['name']);
    }

    if (childAccount) {
      return await this.childAccountFound(parentBook, childBook, parentAccount, childAccount);
    } else {
      return await this.childAccountNotFound(parentBook, childBook, parentAccount);
    }
  }

  private async getChildBook(parentBook: Book, parentAccount: bkper.Account): Promise<Book> {
    if (parentAccount.groups) {
      for (const groupId of parentAccount.groups) {
        let group = await parentBook.getGroup(groupId);
        if (group.getProperty(CHILD_BOOK_ID_PROP)) {
          return Bkper.getBook(group.getProperty(CHILD_BOOK_ID_PROP));
        }
      }
    }
    return null;
  }

  protected abstract childAccountNotFound(baseBook: Book, connectedBook: Book, account: bkper.Account): Promise<string>;

  protected abstract childAccountFound(baseBook: Book, connectedBook: Book, account: bkper.Account, connectedAccount: Account): Promise<string>;

}