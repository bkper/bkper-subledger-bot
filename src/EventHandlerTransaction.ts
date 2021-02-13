import { Account, AccountType, Amount, Book, Group, Transaction } from "bkper";
import { EventHandler } from "./EventHandler";

export interface AmountDescription {
  amount: Amount;
  description: string;
  taxAmount: Amount;
}

export abstract class EventHandlerTransaction extends EventHandler {

  processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string> {
    return null;
  }

  async processChildBookEvent(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {

    let operation = event.data.object as bkper.TransactionOperation;
    let baseTransaction = operation.transaction;

    if (!baseTransaction.posted) {
      return null;
    }

    let iterator = parentBook.getTransactions(this.getTransactionQuery(baseTransaction));
    if (await iterator.hasNext()) {
      let connectedTransaction = await iterator.next();
      return this.parentTransactionFound(childBook, parentBook, baseTransaction, connectedTransaction);
    } else {
      return this.parentTransactionNotFound(childBook, parentBook, baseTransaction)
    }
  }

  protected async getParentAccount(parentBook: Book, childAccount: Account): Promise<Account> {
    let parentAccountName = childAccount.getName();
      let parentAccount = await parentBook.getAccount(parentAccountName);
      if (parentAccount == null) {
        try {
          parentAccount = await parentBook.newAccount()
          .setName(parentAccountName)
          .setType(childAccount.getType())
          .create()
        } catch (err) {
          console.log(err)
          return null;
        }
      }
      return parentAccount;
  } 

  protected async isReadyToPost(newTransaction: Transaction) {
    return await newTransaction.getCreditAccount() != null && await newTransaction.getDebitAccount() != null && newTransaction.getAmount() != null;
  }

  protected abstract getTransactionQuery(childTransaction: bkper.Transaction): string;

  protected abstract parentTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string>;

  protected abstract parentTransactionFound(childBook: Book, parentBook: Book, chilTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string>;
}