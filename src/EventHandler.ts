import { AccountType, Bkper, Book, Group } from "bkper";
import { CHILD_BOOK_ID_PROP, PARENT_BOOK_ID_PROP } from "./constants";

export abstract class EventHandler {

  // parent >> child
  protected abstract processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string>;

  // child >> parent
  protected abstract processChildBookEvent(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string>;

  async handleEvent(event: bkper.Event): Promise<string | boolean> {
    let bookId = event.bookId;
    let baseBook = await Bkper.getBook(bookId);
    let parentBookId = baseBook.getProperty(PARENT_BOOK_ID_PROP, 'parent_book');

    let response = null;
    if (parentBookId) {
      let parentBook = await Bkper.getBook(parentBookId);
      let childBook = baseBook;
      response = await this.processChildBookEvent(childBook, parentBook, event);
    } else {
      let parentBook = baseBook;
      response = await this.processParentBookEvent(parentBook, event);
    }
    if (response == null || response == '') {
      return false;
    }
    return response;
  }

  protected buildBookAnchor(book: Book) {
    return `<a href='https://app.bkper.com/b/#transactions:bookId=${book.getId()}'>${book.getName()}</a>`;
  }

  protected async getGroupAccountType(group: Group): Promise<AccountType> {
    let accounts = await group.getAccounts();
    for (const account of accounts) {
      return account.getType();
    }
    return AccountType.ASSET;
  }

  protected async getLinkedParentGroup(childBook: Book, parentBook: Book, childGroup: Group): Promise<Group> {
    if (childGroup == null) {
      return null;
    }
    let parentGroup = await parentBook.getGroup(childGroup.getName());
    if (parentGroup && parentGroup.getProperty(CHILD_BOOK_ID_PROP) == childBook.getId()) {
      return parentGroup;
    }
    return null;
  }

}