
The Subledger Bot connects child books with parent ones, rolling up the Subledger transactions into the parent General Ledger.

Accounts or Groups in the Subledger are associated to Accounts in the general ledger, allowing the Subledger a more granular control as well as its user access to only a subset of accounts.

<p align="center">
  <img src='https://docs.google.com/drawings/d/e/2PACX-1vTWp1BE5LOoDhu93XiUGg4pverXcHMVQXHyBrd9Q2scAtxixwnlXDI1dioPCswV9VGZW_5gRMPnq1K3/pub?w=3084&h=2676' alt='Bkper Tax Bot in action'/>
</p>

A Subledger may contain, for example, only the details of the [Accounts Receivable](https://help.bkper.com/en/articles/2569170-accounts-receivable) or [Accounts Payable](https://help.bkper.com/en/articles/2569171-accounts-payable) and be shared with a specific department of the business without access to sensitive general ledger account balances and transactions.


## Configuration

The Subledger bot is triggered on ```TRANSACTION_POSTED``` event, and roll the transaction up to the parent book.


### Book property

- ```parent_book_id```: The id of the parent book, found on ```bookId``` param of the url.



