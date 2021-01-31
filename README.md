
The Subledger Bot connects child books with parent ones, rolling up the Subledger transactions into the parent General Ledger.

Groups in the Subledger become accounts in the general ledger, allowing the Subledger a more granular control as well as its user access to only a subset of accounts.

<p align="center">
  <img src='https://docs.google.com/drawings/d/e/2PACX-1vTWp1BE5LOoDhu93XiUGg4pverXcHMVQXHyBrd9Q2scAtxixwnlXDI1dioPCswV9VGZW_5gRMPnq1K3/pub?w=761&h=819' alt='Bkper Tax Bot in action'/>
</p>

A Subledger may contain, for example, only the details of the [Accounts Receivable](https://help.bkper.com/en/articles/2569170-accounts-receivable) or [Accounts Payable](https://help.bkper.com/en/articles/2569171-accounts-payable) and be share with a specific department of the business without access to sensitive general ledger account balances and transactions.


## Configuration

The Subledger bot is triggered on ```TRANSACTION_CHECKED``` event, and roll the transaction up to the parent book.


### Book property

- ```sub_parent_book```: The id of the parent book, found on bookId param of the url.


### Group property

- ```sub_parent_account```: The name of the parent account to bind the child group to.


