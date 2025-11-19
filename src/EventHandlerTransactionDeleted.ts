import { Book, Transaction } from "bkper-js";
import { EventHandlerTransaction } from "./EventHandlerTransaction.js";
import { AppContext } from "./AppContext.js";

export class EventHandlerTransactionDeleted extends EventHandlerTransaction {
  constructor(context: AppContext) {
    super(context);
  }

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected parentTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string> {
    return null;
  }
  protected async parentTransactionFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);

    if (parentTransaction.isChecked()) {
      await parentTransaction.uncheck();
    }

    await parentTransaction.trash();

    let amountFormatted = parentBook.formatValue(parentTransaction.getAmount())

    let record = `DELETED: ${parentTransaction.getDateFormatted()} ${amountFormatted} ${await parentTransaction.getCreditAccountName()} ${await parentTransaction.getDebitAccountName()} ${parentTransaction.getDescription()}`;

    return `${bookAnchor}: ${record}`;
  }

}
