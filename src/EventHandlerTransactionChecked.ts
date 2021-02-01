import { Account, Book, Transaction } from "bkper";
import { SUB_PARENT_ACCOUNT_PROP } from "./constants";
import { EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionChecked extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected async connectedTransactionFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string> {
    if (parentTransaction.isPosted() && !parentTransaction.isChecked()) {
      await parentTransaction.check();
      return await this.buildFoundResponse(parentBook, parentTransaction);
    } else if (!parentTransaction.isPosted() && this.isReadyToPost(parentTransaction)) {
      await parentTransaction.post();
      await parentTransaction.check();
      return await this.buildFoundResponse(parentBook, parentTransaction);
    } else {
      return await this.buildFoundResponse(parentBook, parentTransaction);
    }
  }

  private async buildFoundResponse(parentBook: Book, parentTransaction: Transaction): Promise<string> {
    let bookAnchor = super.buildBookAnchor(parentBook);
    let amountFormatted = parentBook.formatValue(parentTransaction.getAmount());
    let record = `CHECKED: ${parentTransaction.getDateFormatted()} ${amountFormatted} ${await parentTransaction.getCreditAccountName()} ${await parentTransaction.getDebitAccountName()} ${parentTransaction.getDescription()}`;
    return `${bookAnchor}: ${record}`;
  }


  protected async connectedTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string> {
    let childCreditAccount = await childBook.getAccount(childTransaction.creditAccount.id);
    let childDebitAccount = await childBook.getAccount(childTransaction.debitAccount.id);
    let parentBookAnchor = super.buildBookAnchor(parentBook);

    let parentCreditAccount = await this.getParentAccount(parentBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(parentBook, childDebitAccount);


    let newTransaction = parentBook.newTransaction()
      .setDate(childTransaction.date)
      .setProperties(childTransaction.properties)
      .setProperty('sub_credit_account', childCreditAccount.getName())
      .setProperty('sub_debit_account', childDebitAccount.getName())
      .setAmount(childTransaction.amount)
      .setCreditAccount(parentCreditAccount)
      .setDebitAccount(parentDebitAccount)
      .setDescription(childTransaction.description)
      .addRemoteId(childTransaction.id);

    let record = `${newTransaction.getDate()} ${newTransaction.getAmount()} ${parentCreditAccount.getName()} ${parentDebitAccount.getName()} ${newTransaction.getDescription()}`;

    if (this.isReadyToPost(newTransaction)) {
      await newTransaction.post();
      await newTransaction.check();
    } else {
      newTransaction.setDescription(`${newTransaction.getCreditAccount() == null ? parentDebitAccount.getName() : ''} ${newTransaction.getDebitAccount() == null ? parentDebitAccount.getName() : ''} ${newTransaction.getDescription()}`.trim())
      await newTransaction.create();
    }

    return `${parentBookAnchor}: ${record}`;
  }


  private isReadyToPost(newTransaction: Transaction) {
    return newTransaction.getCreditAccount() != null && newTransaction.getDebitAccount() != null && newTransaction.getAmount() != null;
  }


}