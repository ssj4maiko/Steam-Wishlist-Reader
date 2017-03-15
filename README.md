Steam Wishlist Export
==================

This is a Firefox addon for:
- **Export you wishlist to a CSV file**
- **Reorganize your online wishlist in an easier and faster way!**

Instructions:
-----------------

1. Open your Steam Wishlist, be sure to be logged in on your account. There will be two new buttons at the right side, near the list.

2. Press **CSV Export**, and wait (There is in fact no user return right now), the more games you have on it, the more time it will take.

	> According to Steam API limitations, a total of 200 requests can be done per 5 minutes, if your list has over 200 entries, this means you won't be able to get the fully detailed spreadsheet as of now. It will still make the CSV with the available info, and it will work if you reorganize it, but if you need some of the extra info to help the filtering, wait 5 minutes and try again, the extension caches all the data it gets from Steam, so it won't try to get what it already has, this also means that the second time is always faster.

3. Open the CSV on a Spreadsheet software, like LibreOffice Calc, Google Docs Spreadsheets or Microsoft Excel (Tip: Activate Auto-Filter).

4. Move the content the way you need. **Only the GameID column matters when importing back**, you can move it around.

5. Once you finish, just be sure to keep GameIDs and its Header on the first column. Empty lines shouldn't be a problem, also if a GameID that you have on your list is absent when importing, that game will be sent to the end of the list.

Limitations
----------------
Besides the Steam API limitation, right now, the code only works with the English interface.

If you wanna help, there are instructions to add other language compatibility to the code. It was made in haste, also first addon, sorry about that.

Also, even if it inserts all ranks correcntly, I have noticed that Steam seems to get easily lost on big wishlists, so keep your csv in hand just in case.

Languages supported
------------------------------
- English
