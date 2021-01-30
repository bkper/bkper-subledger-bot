import { Account, AccountType, Book, Group } from "bkper";
import { SUB_PARENT_ACCOUNT_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerGroup extends EventHandler {

  protected async processObject(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {
    let childGroup = event.data.object as bkper.Group;

    let parentAccount = await parentBook.getAccount(childGroup.properties[SUB_PARENT_ACCOUNT_PROP]);

    if (parentAccount == null && (event.data.previousAttributes && event.data.previousAttributes[SUB_PARENT_ACCOUNT_PROP])) {
      parentAccount = await parentBook.getAccount(event.data.previousAttributes[SUB_PARENT_ACCOUNT_PROP]);
    }

    if (parentAccount) {
      return await this.parentAccountFound(childBook, parentBook, childGroup, parentAccount);
    } else {
      return await this.parentAccountNotFound(childBook, parentBook, childGroup);
    }
  }

  protected async getChildGroupAccountType(childBook: Book, childGroup: bkper.Group): Promise<AccountType> {
    let group = await childBook.getGroup(childGroup.id);
    return super.getGroupAccountType(group);
  }

  protected abstract parentAccountNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string>;

  protected abstract parentAccountFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentAccount: Account): Promise<string>;

}