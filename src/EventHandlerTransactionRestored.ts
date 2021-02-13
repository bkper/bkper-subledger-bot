import { Book, Transaction } from "bkper";
import { EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionRestored extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id} is:trashed`;
  }

  protected parentTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string> {
    return null;
  }
  protected async parentTransactionFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);

    await parentTransaction.restore();

    let amountFormatted = parentBook.formatValue(parentTransaction.getAmount())

    let record = `RESTORED: ${parentTransaction.getDateFormatted()} ${amountFormatted} ${await parentTransaction.getCreditAccountName()} ${await parentTransaction.getDebitAccountName()} ${parentTransaction.getDescription()}`;

    return `${bookAnchor}: ${record}`;
  }

}
