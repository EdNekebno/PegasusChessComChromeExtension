# PegasusChessComChromeExtension

A chrome extension to enable using the DGT Pegasus board with the chess.com website

Please note this extension is in a fairly early, but functional state. It may be a little specific/fiddly at times and the button/information box aren't pretty. Chrome extensions only work on desktop computers (I think!)

How to use:

Place the files in a folder.
In Chrome in the menu go to "More Tools", "Extensions". 
Click the "Developer Mode" toggle (top right).
Click the "Load unpacked extension" and find the folder.
Make sure the "Pegasus-Chess.com Chrome Extension" extension is enabled with the toggle in the bottom right of its information box

Load the chess.com website (or refresh it). 
Go to start a game - e.g. Play->Computer (probably best to use the computer to test)
Make sure your DGT Pegasus board is set up to the start position and turned on.
Click the ugly "Connect Pegasus" button.
Several lines should be written to the ugly text box. It should end with done to indicate connection is successful (if it isn't, try turning the Pegasus off and on again, refreshing the chess.com page, and try again).
Start your game. Play with the board.

If you forget or there is a problem, at any time during a game you can set up your board to match the on-screen game and connect (if the button is missing for some reason so you can't connect but the board isn't working, try refreshing the chess.com page).

Chess.com has no open API. To send moves the extension uses the same method used by the chrome keyboard extension and the chessnut air programs/apps. Still - disclaimer - use at your own risk, I'm not responsible if chess.com decides they suddenly don't like people using that method.
