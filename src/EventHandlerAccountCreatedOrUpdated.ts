import { Account, AccountType, Book } from "bkper-js";
import { CHILD_BOOK_ID_PROP } from "./constants.js";
import { EventHandlerAccount } from "./EventHandlerAccount.js";

export class EventHandlerAccountCreatedOrUpdated extends EventHandlerAccount {

  // parent >> child
  public async childAccountNotFound(parentBook: Book, childBook: Book, parentAccount: bkper.Account): Promise<string> {
    let childAccount = new Account(childBook);
    await this.syncChildAccount(parentBook, childBook, parentAccount, childAccount);
    await childAccount.create();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD ACCOUNT ${childAccount.getName()} CREATED`;
  }

  protected async childAccountFound(parentBook: Book, childBook: Book, parentAccount: bkper.Account, childAccount: Account): Promise<string> {
    await this.syncChildAccount(parentBook, childBook, parentAccount, childAccount);
    await childAccount.update();
    let bookAnchor = super.buildBookAnchor(childBook);
    return `${bookAnchor}: CHILD ACCOUNT ${childAccount.getName()} UPDATED`;
  }

  protected async syncChildAccount(parentBook: Book, childBook: Book, parentAccount: bkper.Account, childAccount: Account) {
    childAccount.setGroups([]);
    childAccount.setName(parentAccount.name)
      .setType(parentAccount.type as AccountType)
      .setProperties(this.getVisibleProperties(parentAccount.properties))
      .setArchived(parentAccount.archived);
    if (parentAccount.groups) {
      for (const g of parentAccount.groups) {
        let parentGroup = await parentBook.getGroup(g.id);
        if (parentGroup) {
          let childGroup = await childBook.getGroup(parentGroup.getName());
          if (childGroup && parentGroup.getProperty(CHILD_BOOK_ID_PROP) == childBook.getId()) {
            childAccount.addGroup(childGroup);
          }
        }
      }
    }
  }

  // child >> parent
  // async parentAccountNotFound(childBook: Book, parentBook: Book, childAccount: Account): Promise<string> {
  //   let parentAccount = childBook.newAccount();
  //   await this.syncParentAccount(childBook, parentBook, childAccount, parentAccount);
  //   await parentAccount.create();
  //   let bookAnchor = super.buildBookAnchor(parentBook);
  //   return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} CREATED`;
  // }

  // async parentAccountFound(childBook: Book, parentBook: Book, childAccount: Account, parentAccount: Account): Promise<string> {
  //   await this.syncParentAccount(childBook, parentBook, childAccount, parentAccount);
  //   await parentAccount.update();
  //   let bookAnchor = super.buildBookAnchor(parentBook);
  //   return `${bookAnchor}: PARENT ACCOUNT ${parentAccount.getName()} UPDATED`;
  // }

  // protected async syncParentAccount(childBook: Book, parentBook: Book, childAccount: Account, parentAccount: Account) {
  //   parentAccount.setGroups([]);
  //   parentAccount.setName(childAccount.getName())
  //     .setType(childAccount.getType())
  //     .setProperties(childAccount.getProperties())
  //     .setArchived(childAccount.isArchived());
  //   if (childAccount.getGroups()) {
  //     for (const childGroup of await childAccount.getGroups()) {
  //       let parentGroup = await this.getLinkedParentGroup(childBook, parentBook, childGroup);
  //       if (parentGroup) {
  //         parentAccount.addGroup(parentGroup);
  //       }
  //     }
  //   }
  // }



}