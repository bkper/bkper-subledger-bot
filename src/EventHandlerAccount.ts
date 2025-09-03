import { Account, Bkper, Book } from "bkper-js";
import { CHILD_BOOK_ID_PROP } from "./constants.js";
import { EventHandler } from "./EventHandler.js";

export abstract class EventHandlerAccount extends EventHandler {

  // parent >> child
  protected abstract childAccountNotFound(parentBook: Book, childBook: Book, parentAccount: bkper.Account): Promise<string>;
  protected abstract childAccountFound(parentBook: Book, childBook: Book, parentAccount: bkper.Account, childAccount: Account): Promise<string>;
  
  async processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string> {
    let parentAccount = event.data.object as bkper.Account;
    try {

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
    } catch (err) {
      throw `Failed to handle account [${parentAccount.name}] event: ${err}`;
    }

  }

  private async getChildBook(parentBook: Book, parentAccount: bkper.Account): Promise<Book> {
    if (parentAccount.groups) {
      for (const g of parentAccount.groups) {
        let group = await parentBook.getGroup(g.id);
        if (group.getProperty(CHILD_BOOK_ID_PROP)) {
          return this.bkper.getBook(group.getProperty(CHILD_BOOK_ID_PROP));
        }
      }
    }
    return null;
  }





  // child >> parent
  // protected abstract parentAccountNotFound(childBook: Book, parentBook: Book, childAccount: Account): Promise<string>;
  // protected abstract parentAccountFound(childBook: Book, parentBook: Book, childAccount: Account, parentAccount: Account): Promise<string>;

  async processChildBookEvent(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {
    // let childAccountJson = event.data.object as bkper.Account;
    // let childAccount = await childBook.getAccount(childAccountJson.id);

    // if (childAccount.getGroups()) {
    //   for (const childGroup of await childAccount.getGroups()) {
    //     // Roll up into one group
    //     if (childGroup.getProperty(PARENT_ACCOUNT_PROP)) {
    //       // let parentAccount = await parentBook.getAccount(childGroup.getProperty(PARENT_ACCOUNT_PROP));
    //       // if (!parentAccount) {
    //       //   // Only create if not found yet. This should never occur because it will be ready created by grou event
    //       //   return await this.parentAccountNotFound(childBook, parentBook, childAccount);
    //       // }
    //     } else if (await this.getLinkedParentGroup(childBook, parentBook, childGroup)) {
    //       // // Roll up 1-1
    //       // let parentAccount = await parentBook.getAccount(childAccount.getName());
    //       // if (parentAccount == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
    //       //   parentAccount = await childBook.getAccount(event.data.previousAttributes['name']);
    //       // }
    //       // if (parentAccount) {
    //       //   return await this.parentAccountFound(childBook, parentBook, childAccount, parentAccount);
    //       // } else {
    //       //   return await this.parentAccountNotFound(childBook, parentBook, childAccount);
    //       // }
    //     }
    //   }
    // }
    return null;
  }


}