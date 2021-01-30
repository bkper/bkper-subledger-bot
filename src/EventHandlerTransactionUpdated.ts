import { Account, Book, Transaction } from "bkper";
import { AmountDescription, EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionUpdated extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected connectedTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string> {
    return null;
  }
  protected async connectedTransactionFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string> {
    let childCreditAccount = await childBook.getAccount(childTransaction.creditAccount.id);
    let childDebitAccount = await childBook.getAccount(childTransaction.debitAccount.id);
    let parentBookAnchor = super.buildBookAnchor(parentBook);

    let parentCreditAccount = await this.getParentAccount(parentBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(parentBook, childDebitAccount);


    let bookAnchor = super.buildBookAnchor(parentBook);

    await this.updateParentTransaction(parentBook, parentTransaction, childTransaction, childCreditAccount, childDebitAccount);

    let amountFormatted = parentBook.formatValue(parentTransaction.getAmount())

    let record = `EDITED: ${parentTransaction.getDateFormatted()} ${amountFormatted} ${await parentTransaction.getCreditAccountName()} ${await parentTransaction.getDebitAccountName()} ${parentTransaction.getDescription()}`;

    return `${bookAnchor}: ${record}`;
  }



  private async updateParentTransaction(parentBook: Book, parentTransaction: Transaction, childTransaction: bkper.Transaction, childCreditAccount: Account, childDebitAccount: Account) {
    if (parentTransaction.isChecked()) {
      await parentTransaction.uncheck();
    }

    parentTransaction
      .setDate(childTransaction.date)
      .setProperties(childTransaction.properties)
      .setProperty('sub_credit_account', childCreditAccount.getName())
      .setProperty('sub_debit_account', childDebitAccount.getName())
      .setAmount(childTransaction.amount)
      .setCreditAccount(childCreditAccount)
      .setDebitAccount(childDebitAccount)
      .setDescription(childTransaction.description)
      .addRemoteId(childTransaction.id);


    let urls = childTransaction.urls;
    if (!urls) {
      urls = [];
    }

    if (parentTransaction.getUrls()) {
      urls = urls.concat(parentTransaction.getUrls());
    }

    if (childTransaction.files) {
      childTransaction.files.forEach(file => {
        urls.push(file.url);
      });
    }

    parentTransaction.setUrls(urls);

    await parentTransaction.update();
  }



}

