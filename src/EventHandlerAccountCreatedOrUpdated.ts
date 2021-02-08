import { Account, AccountType, Book } from "bkper";
import { EventHandlerAccount } from "./EventHandlerAccount";

export class EventHandlerAccountCreatedOrUpdated extends EventHandlerAccount {

  public async parentAccountNotFound(childBook: Book, parentBook: Book, childAccount: bkper.Account): Promise<string> {

    let parentAccount = parentBook.newAccount();
    await this.syncAccounts(childBook, parentBook, childAccount, parentAccount);
    await parentAccount.create();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} CREATED`;
  }

  protected async parentAccountFound(childBook: Book, parentBook: Book, childAccount: bkper.Account, parentAccount: Account): Promise<string> {
    await this.syncAccounts(childBook, parentBook, childAccount, parentAccount);
    await parentAccount.update();
    let bookAnchor = super.buildBookAnchor(parentBook);
    return `${bookAnchor}: ACCOUNT ${parentAccount.getName()} UPDATED`;
  }

  protected async syncAccounts(childBook: Book, parentBook: Book, childAccount: bkper.Account, parentAccount: Account) {
    parentAccount.setGroups([]);
    parentAccount.setName(childAccount.name)
      .setType(childAccount.type as AccountType)
      .setProperties(childAccount.properties)
      .setArchived(childAccount.archived);
    if (childAccount.groups) {
      for (const baseGroupId of childAccount.groups) {
        let baseGroup = await childBook.getGroup(baseGroupId);
        if (baseGroup) {
          let connectedGroup = await parentBook.getGroup(baseGroup.getName());
          if (connectedGroup == null) {
            connectedGroup = await parentBook.newGroup()
              .setHidden(baseGroup.isHidden())
              .setName(baseGroup.getName())
              .setProperties(baseGroup.getProperties())
              .create();
          }
          parentAccount.addGroup(connectedGroup);
        }
      }
    }
  }


}