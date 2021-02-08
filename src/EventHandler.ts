import { AccountType, Bkper, Book, Group } from "bkper";
import { PARENT_BOOK_ID_PROP } from "./constants";

export abstract class EventHandler {

  protected abstract processObject(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string>;

  async handleEvent(event: bkper.Event): Promise<string | boolean> {
    let bookId = event.bookId;
    let childBook = await Bkper.getBook(bookId);
    let parentBookId = childBook.getProperty(PARENT_BOOK_ID_PROP, 'parent_book');

    if (parentBookId == null || parentBookId == '') {
      throw `Please set the [${PARENT_BOOK_ID_PROP}] property of this book, with the parent book id.`
    }
    let parentBook = await Bkper.getBook(parentBookId);
    let response = await this.processObject(childBook, parentBook, event);
    if (response == null || response == '') {
      return false;
    }
    return response;
  }

  protected async getGroupAccountType(group: Group): Promise<AccountType> {
    let accounts = await group.getAccounts();
    for (const account of accounts) {
      return account.getType();
    }
    return AccountType.ASSET;
  }

  protected buildBookAnchor(book: Book) {
    return `<a href='https://app.bkper.com/b/#transactions:bookId=${book.getId()}'>${book.getName()}</a>`;
  }

}