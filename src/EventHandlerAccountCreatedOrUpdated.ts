import { Account, AccountType, Book } from "bkper";
import { EventHandlerAccount } from "./EventHandlerAccount";

export class EventHandlerAccountCreatedOrUpdated extends EventHandlerAccount {

  public async childAccountNotFound(parentBook: Book, childBook: Book, parentAccount: bkper.Account): Promise<string> {

    let childAccount = childBook.newAccount();
    await this.syncChildAccounts(parentBook, childBook, parentAccount, childAccount);
    await childAccount.create();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD ACCOUNT ${childAccount.getName()} CREATED`;
  }

  protected async childAccountFound(parentBook: Book, childBook: Book, parentAccount: bkper.Account, childAccount: Account): Promise<string> {
    await this.syncChildAccounts(parentBook, childBook, parentAccount, childAccount);
    await childAccount.update();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD ACCOUNT ${childAccount.getName()} UPDATED`;
  }

  protected async syncChildAccounts(parentBook: Book, childBook: Book, parentAccount: bkper.Account, childAccount: Account) {
    childAccount.setGroups([]);
    childAccount.setName(parentAccount.name)
      .setType(parentAccount.type as AccountType)
      .setProperties(parentAccount.properties)
      .setArchived(parentAccount.archived);
    if (parentAccount.groups) {
      for (const baseGroupId of parentAccount.groups) {
        let baseGroup = await parentBook.getGroup(baseGroupId);
        if (baseGroup) {
          let connectedGroup = await childBook.getGroup(baseGroup.getName());
          if (connectedGroup == null) {
            connectedGroup = await childBook.newGroup()
              .setHidden(baseGroup.isHidden())
              .setName(baseGroup.getName())
              .setProperties(baseGroup.getProperties())
              .create();
          }
          childAccount.addGroup(connectedGroup);
        }
      }
    }
  }


}