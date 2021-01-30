import { Account, Book, Group } from "bkper";
import { SUB_PARENT_ACCOUNT_PROP } from "./constants";
import { EventHandlerGroup } from "./EventHandlerGroup";

export class EventHandlerGroupCreatedOrUpdated extends EventHandlerGroup {
  protected async parentAccountNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string> {
    let parentAccount = await parentBook.newAccount()
    .setName(childGroup.properties[SUB_PARENT_ACCOUNT_PROP])
    .setType(await this.getChildGroupAccountType(childBook, childGroup))
    .create();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} CREATED`;
  }
  protected async parentAccountFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentAccount: Account): Promise<string> {
    await parentAccount
    .setName(childGroup.properties[SUB_PARENT_ACCOUNT_PROP])
    .setType(await this.getChildGroupAccountType(childBook, childGroup))
    .update();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} UPDATED`;
  }


}