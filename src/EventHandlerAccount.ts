import { Account, Book } from "bkper";
import { PARENT_ACCOUNT_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerAccount extends EventHandler {

  protected async processObject(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {
    let childAccount = event.data.object as bkper.Account;

    const subParentAccountName = childAccount.properties[PARENT_ACCOUNT_PROP];

    if (!subParentAccountName) {
      return null;
    }

    let parentAccount = await parentBook.getAccount(subParentAccountName);

    if (parentAccount == null && (event.data.previousAttributes && event.data.previousAttributes[PARENT_ACCOUNT_PROP])) {
      parentAccount = await parentBook.getAccount(event.data.previousAttributes[PARENT_ACCOUNT_PROP]);
    }

    if (parentAccount) {
      return await this.parentAccountFound(childBook, parentBook, childAccount, parentAccount);
    } else {
      return await this.parentAccountNotFound(childBook, parentBook, childAccount);
    }

  }

  protected abstract parentAccountNotFound(baseBook: Book, connectedBook: Book, account: bkper.Account): Promise<string>;

  protected abstract parentAccountFound(baseBook: Book, connectedBook: Book, account: bkper.Account, connectedAccount: Account): Promise<string>;

}