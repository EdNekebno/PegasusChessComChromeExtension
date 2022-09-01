const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
const TX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
const RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

var options = {
  filters: [{services: [SERVICE_UUID]}],
}

var developerkey = new Uint8Array([0x63, 0x07, 0xbe, 0xf5, 0xae, 0xdd, 0xa9, 0x5f, 0x00]);
var commandat = new Uint8Array([0x40]);
var flashtest = new Uint8Array([0x60, 0x06, 0x05, 0x07, 0x01, 0x01, 0x02, 0x00]);
var commandbitboard = new Uint8Array([0x42]);
var commandsendupdates = new Uint8Array([0x44]);

var ccomboard = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

function checkboard(value) {
	if (document.getElementById('game-over-modal-content')) {
		if (document.getElementById('game-over-modal').innerHTML.length > 15 || document.getElementById('game-over-modal-content').innerHTML.length > 15) {
			// If there is a game-over-modal then don't send moves. Instead ensure the LEDs are turned offscreenBuffering
			flashleds(new Array());
			return;
		}
	}
	if (!document.getElementsByTagName('chess-board')[0]) {
		// If there's no chessboard then don't act!
		return;
	}
	// Put the chess.com board into ccomboard and compare it to what has been returned from the Pegasus
	for (var o = 0; o < 64; o++) { ccomboard[o] = 0; }
	var cb = document.getElementsByTagName('chess-board')[0];
	var cdivs = cb.getElementsByTagName('div');
	for (var i = 0; i < cdivs.length; i++) { 		
		if (cdivs[i].className.indexOf('piece') >= 0) {
			sq = cdivs[i].className.substring(cdivs[i].className.length-2,cdivs[i].className.length); 
			//console.log(sq);
			sqc = sq.substring(0,1);
			sqr = sq.substring(1,2);
			//console.log(sqc + "-" + sqr);
			// We actually want to rotate this to match the pegasus which goes from top left :(
			sqc = Math.abs(sqc - 1);			
			sqr = Math.abs(sqr - 8);					
			//console.log(sqc + "-" + sqr);
			sqnum = sqc + (sqr * 8);
			//console.log(sqnum);
			ccomboard[sqnum] = 1;
		}
	}
	//console.log(ccomboard);
	//console.log(value);
	var missing = new Array();
	for (var i = 3; i < value.byteLength; i++) {
		var v = value.getUint8(i);
		if (v != ccomboard[i - 3]) {
			missing.push(i - 3);
		}
	}
	//console.log(missing);
	// If the length of missing is 1 and it's the other player's turn then grab the highlight squares and flash those instead
	if (missing.length == 1 && uppos == "") {
		var player;
		if (document.getElementsByTagName('chess-board')[0].getElementsByTagName('svg')[0].getElementsByTagName('text')[0].innerHTML == '8') {
			player = "white";
		} else {
			player = "black";
		}
		var highlights = new Array();
		var cb = document.getElementsByTagName('chess-board')[0];
		var cdivs = cb.getElementsByTagName('div');
		piececolor = "";
		for (var i = 0; i < cdivs.length; i++) { 		
			if (cdivs[i].className.indexOf('highlight') >= 0) {
				console.log(cdivs[i].className);
				sq = cdivs[i].className.substring(cdivs[i].className.length-2,cdivs[i].className.length);
				for (var j = 0; j < cdivs.length; j++) {
					if (cdivs[j].className.indexOf('square-' + sq) > 0 && cdivs[j].className.indexOf('highlight') < 0) {
						console.log(cdivs[j]);
						piececolor = cdivs[j].className.substr(6,1);
						console.log(piececolor);
					}
				}
				console.log(sq);
				sqc = sq.substring(0,1);
				sqr = sq.substring(1,2);
				//console.log(sqc + "-" + sqr);
				// We actually want to rotate this to match the pegasus which goes from top left :(
				sqc = Math.abs(sqc - 1);			
				sqr = Math.abs(sqr - 8);					
				//console.log(sqc + "-" + sqr);
				sqnum = sqc + (sqr * 8);
				//console.log(sqnum);
				highlights.push(sqnum);
			}
		}
		if (player == "white" && piececolor == "b") {
			missing = highlights;
		}
		if (player == "black" && piececolor == "w") {
			missing = highlights;
		}
	}
	flashleds(missing);
}

var lastleds = new Array();

async function flashleds(ledlist) {
	// Flash the leds in the given array	
	if (ledlist.length == 0 && lastleds.length != 0) {
		ab = new Uint8Array(4);
		ab[0] = 96;
		ab[1] = 2;
		ab[2] = 0;
		ab[3] = 0;
		await characteristictx.writeValue(ab);
		lastleds = new Array();
		return;
	}
	ab = new Uint8Array(7 + ledlist.length);
	ab[0] = 96;
	ab[1] = 5 + ledlist.length;
	ab[2] = 5;
	ab[3] = 2;
	ab[4] = 0;
	ab[5] = 1;
	for (var i =0 ; i < ledlist.length; i++) {
		ab[6+i] = ledlist[i];
	}
	ab[6 + ledlist.length] = 0;
	//console.log(ab);
	var match = 0;
	if (lastleds.length == ledlist.length) {
		match = 1;
		for (var u = 0; u < lastleds.length; u++) {
			if (lastleds[u] != ledlist[u]) {
				match = 0;
			}
		}
	}
	if (!document.getElementsByTagName('chess-board')[0]) {
		// If there's no chessboard then don't act!
		match = 1;
	}
	if (match == 0) {
		lastleds = ledlist;	
		counter = 0;
		success = 0;
		while (success == 0 && counter < 30) {		
			try {
				await characteristictx.writeValue(ab);
				success = 1;
			} catch (err) {
				counter = counter + 1;
			}
		}
	}
}

async function checkstate() {
	counter = 0;
	success = 0;
	while (success == 0 && counter < 30) {		
		try {	
			await characteristictx.writeValue(commandbitboard);
			success = 1;
		} catch (err) {
			counter = counter + 1;
		}
	}		
}


function pointerdown(hp, vp) {
	console.log("firing down");
	console.log(hp);
	console.log(vp);
	var el = document.getElementsByTagName("chess-board")[0];
	var evt = new PointerEvent('pointerdown', {clientX: hp, clientY: vp, bubbles: true});
	el.dispatchEvent(evt);
	var m = new MouseEvent("mousedown", {clientX: hp, clientY: vp, bubbles: true});
	el.dispatchEvent(m);
}

function pointermove(hp, vp) {
	console.log("moving");
	console.log(hp);
	console.log(vp);
	var el = document.getElementsByTagName("chess-board")[0];
	var evt = new PointerEvent('pointerdown', {clientX: hp, clientY: vp, bubbles: true});
	el.dispatchEvent(evt);
	var m = new MouseEvent("mousedown", {clientX: hp, clientY: vp, bubbles: true});
	el.dispatchEvent(m);
}

function pointerup(hp, vp) {
	console.log("firing up");
	console.log(hp);
	console.log(vp);
	var el = document.getElementsByTagName("chess-board")[0];
	var evt3 = new PointerEvent('pointerup',  {clientX: hp, clientY: vp, bubbles: true});
	el.dispatchEvent(evt3);
	var m = new MouseEvent("mouseup", {clientX: hp, clientY: vp, bubbles: true});
	el.dispatchEvent(m);
}


function pegasusmove(fromsqnum,tosqnum) {
	if (document.getElementById('game-over-modal-content')) {
		if (document.getElementById('game-over-modal').innerHTML.length > 15 || document.getElementById('game-over-modal-content').innerHTML.length > 15) {
			// If there is a game-over-modal then don't send moves. Instead ensure the LEDs are turned offscreenBuffering
			flashleds(new Array());
			return;
		}
	}
	if (!document.getElementsByTagName('chess-board')[0]) {
		// If there's no chessboard then don't act!
		return;
	}
	var player;
	if (document.getElementsByTagName('chess-board')[0].getElementsByTagName('svg')[0].getElementsByTagName('text')[0].innerHTML == '8') {
		player = "white";
	} else {
		player = "black";
	}
	if (player == "black") {
		// If the player is black then the board is rotated and 0 is bottom right
		sqrow = Math.floor(fromsqnum/8);
		sqcol = fromsqnum - (sqrow * 8);
		sqrow = 7 - sqrow;
		sqcol = 7 - sqcol;
		fromsqnum = (sqrow * 8) + sqcol;
		sqrow = Math.floor(tosqnum/8);
		sqcol = tosqnum - (sqrow * 8);
		sqrow = 7 - sqrow;
		sqcol = 7 - sqcol;
		tosqnum = (sqrow * 8) + sqcol;		
	}
	var squaresize = (document.getElementsByTagName('chess-board')[0].getBoundingClientRect().right - document.getElementsByTagName('chess-board')[0].getBoundingClientRect().left) / 8;
	var lp = document.getElementsByTagName('chess-board')[0].getBoundingClientRect().left;
	var tp = document.getElementsByTagName('chess-board')[0].getBoundingClientRect().top;
	sqrow = Math.floor(fromsqnum/8);
	sqcol = fromsqnum - (sqrow * 8);
	var hp = lp + (sqcol * squaresize);
	var vp = tp + (sqrow * squaresize);
	hp = hp + (squaresize / 2);
	vp = vp + (squaresize / 2);
	pointerdown(hp,vp);
	pointerup(hp,vp);
	sqrow = Math.floor(tosqnum/8);
	sqcol = tosqnum - (sqrow * 8);
	hp = lp + (sqcol * squaresize);
	vp = tp + (sqrow * squaresize);
	hp = hp + (squaresize / 2);
	vp = vp + (squaresize / 2);
	pointermove(hp,vp);
	pointerup(hp,vp);	
}

var pickups = 0;
var uppos = "";
var upsq = -1;

async function ble() {
	var device;
	var service;
	var characteristicsrx;
	var characteristicstx;
	var characteristicrx;
	var characteristicstx;

	var txt = document.createElement("textarea");
	txt.style.zIndex = '10';
	txt.style.position = 'absolute';
	txt.style.backgroundColor = "white";
	txt.style.color = "black";
	txt.style.top = '66px';
	txt.style.width = '230px';
	txt.style.height = '500px';
	txt.style.left = '1500px';
	txt.innerHTML = 'RESPONSE\n';
	document.body.appendChild(txt);
	const button = document.createElement('button');
	button.innerHTML = 'Connect Pegasus'
	button.style.zIndex = '10';
	button.style.position = 'absolute';
	button.onclick = async () => {
	  // Get and connect to the board
	  txt.innerHTML = txt.innerHTML + "Finding board\n";
	  device = await navigator.bluetooth.requestDevice(options);
	  txt.innerHTML = txt.innerHTML + "Connecting\n";
	  server = await device.gatt.connect();	  
	  txt.innerHTML = txt.innerHTML + "Connected\n";
	  txt.innerHTML = txt.innerHTML + "Getting service information\n";
	  service = await server.getPrimaryService(SERVICE_UUID);
	  characteristicsrx = await service.getCharacteristics(RX_CHARACTERISTIC_UUID);
	  characteristicrx = characteristicsrx.find(char => char.uuid === RX_CHARACTERISTIC_UUID);
	  characteristicstx = await service.getCharacteristics(TX_CHARACTERISTIC_UUID);
	  characteristictx = characteristicstx.find(char => char.uuid === TX_CHARACTERISTIC_UUID);
	  txt.innerHTML = txt.innerHTML + "Got service information\n";
	  txt.innerHTML = txt.innerHTML + "Setting up notifications\n";
	  characteristicrx.startNotifications();	  
	  characteristicrx.addEventListener("characteristicvaluechanged", event=>{
		//txt.innerHTML = txt.innerHTML + "Got some input from board\n";	
		var value = event.target.value;		
		//console.log(value);		
		//console.log(value.byteLength);		
		//for (var i = 0; i < value.byteLength; i++) {
		//	var v = value.getUint8(i);
		//	txt.innerHTML = txt.innerHTML + v + ", ";
		//}
		//txt.innerHTML = txt.innerHTML + "\nEnd input\n";		
		if (value.getUint8(0) == 134) {
			// Pegasus has given us a board dump. Do a comparison
			checkboard(value);
		}
		if (value.getUint8(0) == 142) {
			if (document.getElementById('game-over-modal-content')) {
				if (document.getElementById('game-over-modal').innerHTML.length > 15 || document.getElementById('game-over-modal-content').innerHTML.length > 15) {
					// If there is a game-over-modal then don't send moves. Instead ensure the LEDs are turned offscreenBuffering
					flashleds(new Array());
					return;
				}
			}
			if (!document.getElementsByTagName('chess-board')[0]) {
				// If there's no chessboard then don't act!
				return;
			}
			// A piece has been updated. 
			if (value.getUint8(4) == 0) {
				// A piece has been lifted. We should only care if it is one of our pieces.
				var player;
				if (document.getElementsByTagName('chess-board')[0].getElementsByTagName('svg')[0].getElementsByTagName('text')[0].innerHTML == '8') {
					player = "white";
				} else {
					player = "black";
				}
				console.log(player);
				// But to check we need to turn the field to the chesscom format
				var field = value.getUint8(3);
				upsq = field;
				console.log(field);
				row = Math.floor(field /8);
				col = field - (row * 8);
				row = 7 - row;
				row = row + 1;
				col = col + 1;
				console.log("lifted");
				console.log(col + "" + row);
				// Now find the piece that has been lifted
				var cb = document.getElementsByTagName('chess-board')[0];
				var cdivs = cb.getElementsByTagName('div');
				piecename = "";
				for (var i = 0; i < cdivs.length; i++) { 		
					if (cdivs[i].className.indexOf('square-' + col + "" + row) >= 0) {
						if (cdivs[i].className.indexOf("piece ") >= 0) {
							console.log(cdivs[i].className);
							piecename = cdivs[i].className.substr(6,2);
							console.log(cdivs[i]);
						}
					}
				}
				if (piecename.substr(0,1) == "w" && player == "black") { piecename = ""; }
				if (piecename.substr(0,1) == "b" && player == "white") { piecename = ""; }
				console.log(piecename);				
				if (piecename != "") {
					console.log("increase pickups");				
					pickups++;
					console.log(pickups);
					uppos = col + "" + row;
				}
			}
			if (value.getUint8(4) == 1) {
				// A piece has been placed back down	
				console.log("decrease pickups");
				pickups--;
				if (pickups < 0) { pickups = 0; }
				console.log(pickups);
				if (pickups == 0 && uppos != "") {
					console.log("tracked down");
					// A piece has been placed down from uppos that is the correct color
					var field = value.getUint8(3);
					console.log(field);
					row = Math.floor(field /8);
					col = field - (row * 8);
					row = 7 - row;
					row = row + 1;
					col = col + 1;
					console.log("placed");
					console.log(col + "" + row);
					downpos = col + "" + row;
					pegasusmove(upsq, field);
					uppos = "";
				}
			}
			checkstate();
		}
	  });	  
	  setInterval(checkstate, 500);
	  txt.innerHTML = txt.innerHTML + "Notifications setup\n";
	  button.style.display = 'none';
	  // Now initialise the board
	  txt.innerHTML = txt.innerHTML + "Writing Developer Key\n";
	  await characteristictx.writeValue(developerkey);
	  txt.innerHTML = txt.innerHTML + "Sending board reset\n";
	  await characteristictx.writeValue(commandat);
	  txt.innerHTML = txt.innerHTML + "Asking for bitboard\n";
	  await characteristictx.writeValue(commandbitboard);
	  txt.innerHTML = txt.innerHTML + "Asking for updates\n";
	  await characteristictx.writeValue(commandsendupdates);
	  txt.innerHTML = txt.innerHTML + "Done\n";
	  flashleds(new Array(0,1,2,3,4,5,6,7));
	}	
	document.body.appendChild(button);
}

ble();