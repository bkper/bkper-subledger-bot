import { Account, AccountType, Book } from "bkper";
import { PARENT_ACCOUNT_PROP } from "./constants";
import { EventHandlerAccount } from "./EventHandlerAccount";

export class EventHandlerAccountCreatedOrUpdated extends EventHandlerAccount {

  protected async parentAccountNotFound(childBook: Book, parentBook: Book, childAccount: bkper.Account): Promise<string> {
    console.log(`CREATE: ${childAccount.properties[PARENT_ACCOUNT_PROP]}`)
    let parentAccount = await parentBook.newAccount()
      .setName(childAccount.properties[PARENT_ACCOUNT_PROP])
      .setType(childAccount.type as AccountType)
      .create();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} CREATED`;
  }
  protected async parentAccountFound(childBook: Book, parentBook: Book, childAccount: bkper.Account, parentAccount: Account): Promise<string> {
    console.log(`UPDATE: ${childAccount.properties[PARENT_ACCOUNT_PROP]}`)
    await parentAccount
      .setName(childAccount.properties[PARENT_ACCOUNT_PROP])
      .setType(childAccount.type  as AccountType)
      .update();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} UPDATED`;
  }

}