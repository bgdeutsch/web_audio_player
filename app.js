function initAudio(){

	//Establish some variables for later use.
	var audio, seekslider, volumeslider, seeking=false, seekto,
		current_time_text, duration_time_text, dir, playlist, playlist_index,
		track_info, my_playlist;

	var play_button    = $('.ion-play');
	var pause_button   = $('.ion-pause');
	var stop_button    = $('.ion-stop');
	var volumeslider   = $('#volumeslider');
	var next_button	   = $('.ion-arrow-right-a');
	var prev_button    = $('.ion-arrow-left-a');
	var mute_button	   = $('.ion-volume-mute');
	var med_volume     = $('.ion-volume-medium');
	var playlist_track = $('#my_playlist li');
	dir 		   	   		 = 'media/';
	playlist_index     = 0;
	seekslider   	     = document.getElementById('seekslider');
	current_time_text  = document.getElementById('current_time_text');
	duration_time_text = document.getElementById('duration_time_text');
	track_info  	     = document.getElementById('track_info');
	my_playlist		     = document.getElementById('my_playlist');
	playlist           = [
		{'artist':'A Tribe Called Quest', 'track':'CanI.mp3', 'title':'Can I Kick It?'},
		{'artist':'Rx Bandits', 'track':'Decrescendo.mp3', 'title':'Decrescendo (Live)'},
		{'artist':'Everclear', 'track':'SoMuch.mp3', 'title':'So Much For The Afterglow'},
		{'artist':'Lifetime', 'track':'Haircuts.mp3', 'title':'Haircuts & T-Shirts'},
		{'artist':'The Police', 'track':'CantStand.mp3', 'title':'Cant Stand Losing You'}
	];


	//Audio object istantiation and options.
	audio = new Audio();
	audio.src = dir+playlist[0].track;
	audio.loop = false;
	audio.play();

	//Fill the track information box with artist and title.
	track_info.innerHTML = (playlist[0].artist)+' - '+(playlist[0].title);

	//Hide play button, as the first track plays automatically on page load.
	//Hide mute butotn, as the first track will not be muted, it will be loud!
	$('#play').hide();
	$(mute_button).hide();

	//Event Handlers
	$(play_button).click(play_audio);
	$(pause_button).click(pause_audio);
	$(stop_button).click(stop_audio);
	$(next_button).click(next_song);
	$(prev_button).click(previous_song);
	$(med_volume).click(mute_audio);
	$(mute_button).click(mute_audio);
	$(playlist_track).click(user_change_song);

	//to be refactored.  Event listener below executes seektimeupdate function as the song plays
	//(as duration of song changes)
	audio.addEventListener('timeupdate', function(){
		seektimeupdate();
	});

	//When the song ends, execute a change song function so the next
	//song in the playlist automatically plays.
	audio.addEventListener('ended', function(){
		next_song();
	});

	//The following three event handlers/functions are described
	//in more detail below, beginning on line 68.
	$(seekslider).mousedown(function(e){
		seeking = true;
		seek(e);
	});

	$(seekslider).mousemove(function(e){
		seek(e);
	});

	$(seekslider).mouseup(function(e){
		seeking = false;
	});

	$(volumeslider).mousemove(set_volume);


	/**
	*Functions!
	**/


	// Change song in playlist according to front-end UI.
	function user_change_song(){
		$('#play').hide();
		$('#stop').show();
		//Each track in the playlist has correlating data attributes from the front-end.
		//The song attribute loads the song file, while the rel keeps the playlist array
		//index in line properly.
		var track = $(this).attr('song');
		playlist_index = $(this).attr('rel');
		//Display track info in the correct location, change which song is 'active', play track!
		track_info.innerHTML = $(this).text();
		$(playlist_track).removeClass('active');
		$(this).addClass('active');
		audio.src=dir+track;
		audio.play();
	};

	//Change to next song automatically in playlist when previous song has ended.
	function next_song(){

		//Check to see if the current song is the last in the playlist.
		//If this is the case we can reset the playlist by pointing to the
		//0 index.  If not the last song in the playlist, increment the
		//array index by 1.
		if(playlist_index === (playlist.length - 1)){
			$('#my_playlist li').first().addClass('active');
			$('#my_playlist li').last().removeClass('active');
			playlist_index = 0;
		} else {
			$('li.active').next().addClass('active');
			$('#my_playlist li.active').first().removeClass('active');
			playlist_index++;
		}

			//Update the current song, and play it after switching songs.
			track_info.innerHTML = (playlist[playlist_index].artist)+' - '+playlist[playlist_index].title;
			audio.src = dir+playlist[playlist_index].track;
			audio.play();
	}//End next_song()

	//Change to previous song when user clicks back arrow.
	function previous_song(){
		if (playlist_index === 0){
			$('#my_playlist li').last().addClass('active');
			$('#my_playlist li').first().removeClass('active');
			playlist_index = playlist.length - 1;
		}else{
			$('#my_playlist li.active').prev().addClass('active');
			$('#my_playlist li.active').last().removeClass('active');
			playlist_index--;
		}

			//Update the current song, and play it after switching songs.
			track_info.innerHTML = playlist[playlist_index].artist+' - '+playlist[playlist_index].title;
			audio.src = dir+playlist[playlist_index].track;
			audio.play();
	}

	//Play audio.  When audio is currently playing, hide the play button
	//and show the stop button.
	function play_audio(){
		audio.play();
		$('#play').hide();
		$('#stop').show();
	}

	//Pause audio. When audio is paused, show the play button so the user can
	//play the song when ready.
	function pause_audio(){
		audio.pause();
		$('#stop').hide();
		$('#play').show();
	}

	//Stop audio, show play button, set current play time to 0:00.
	function stop_audio(){
		audio.pause();
		$('#stop').hide();
		$('#play').show();
		audio.currentTime = 0;
	}

	//Mute Audio function
	function mute_audio(){
		if(audio.muted){
			audio.muted = false;
			$(med_volume).show();
			$(mute_button).hide();
		}else{
			audio.muted = true;
			$(mute_button).show();
			$(med_volume).hide();
		}
	}

	//Volume fuctionality.  The volume property returns a value between
	//0.0 and 1.0; parseFloat lets us work with that.
	function set_volume(){
		audio.volume = parseFloat(this.value / 100);
	}

	//Seek function - whe user performs mousemove action on seek slider, skip to
	//desired time in the song.
	//Seeking is false by default; it will be true only when a user fires a mousedown event
	//and drags the seek slider.  The seek slider's value
	//changes as user drags it. clientX - seekslider.offsetLeft
	//gives us the exact location of the slider knob.  After
	//figuring where we are in the track, we can set currentTime
	//property of audio object to where the user wants to be in the song.
	//**Deep breath**//

	function seek(e){
		if(seeking){
			seekslider.value = parseFloat(e.clientX - seekslider.offsetLeft);
			console.log(typeof(seekslider.value));
			console.log(seekslider.value, audio.currentTime);
			seekto = audio.duration * (seekslider.value / 100);
			console.log(seekto);
			audio.currentTime = seekto;
		}
	}

	function seektimeupdate(){
		var new_time = audio.currentTime * (100 / audio.duration);
		seekslider.value = new_time;
		var current_minutes = Math.floor(audio.currentTime / 60);
		var current_seconds = Math.floor(audio.currentTime - current_minutes * 60);
		var duration_minutes = Math.floor(audio.duration / 60);
		var duration_seconds = Math.floor(audio.duration - duration_minutes * 60);

		//Add 0 to any single digits in the time of song
		// for aesthetic purposes; i.e. 1:05 is standard (vs 1:5).
		if(current_seconds < 10)  { current_seconds  = '0' + current_seconds; }
		if(current_minutes < 10)  { current_minutes  = '0' + current_minutes; }
		if(duration_seconds < 10) { duration_seconds = '0' + duration_seconds; }
		if(duration_minutes < 10) { duration_minutes = '0' + duration_minutes; }

		//Set the currentTime of the song to follow as it plays,
		//and set the duration so user knows how long the song will play.
		current_time_text.innerHTML = current_minutes+':'+current_seconds;
		duration_time_text.innerHTML = duration_minutes+':'+duration_seconds;
	}

	/**
	**Analyzer Functionality**
	**/

	//Instaniate a new Audio Context object.
	var context = new (window.AudioContext || window.webkitAudioContext)();
	//Create new Media Element Source and pass in the existing audio object.
	var source  = context.createMediaElementSource(audio);
	//Create analyser node to catch frequency data.
	var analyser = context.createAnalyser();
	//Bind the new analyser object to the media element.
	source.connect(analyser);
	//Output audio to user.  (i.e. jam music through speakers!)
	source.connect(context.destination);

	//Generate an array of random 8-bit integers, store it.
	//Limiting the frequency data to 90 because using the full audio spectrum
	//Has caused some performance issues.
	var frequencyData = new Uint8Array(90);

	//Set up the SVG canvas variables.
	var height = '300';
	var width  = '1500';
	var barPadding = '2';

	//Create the SVG by informing D3 of which DOM element to act on,
	//and set desired attributes.
	function createSvg(parent, height, width) {
		return d3.select(parent).append('svg').attr('height', height).attr('width', width);
	}

	var svg = createSvg('body', height, width);

	svg.selectAll('rect')
	//Binds the array of data that was created earlier, to the SVG elements.
	.data(frequencyData)
	//Enter function tells D3 to go create new nodes based on the data.
	.enter()
	.append('rect')
	//Using the frequencyData array index and performing some math to space out each bar evenly.
	.attr('x', function (d, i) {
		return i * (width / frequencyData.length);
	})
	.attr('width', width / frequencyData.length - barPadding)

	//Creates two fill colors for the animated bars,
	//based on whether the index is even or odd.
	.style("fill", function(d, i) {
		return i % 2 ? '#3cd3ad' : "#4CB8C4";
	});

	//renderBars() will continually update the animation at a very high rate.
	function renderBars() {
		requestAnimationFrame(renderBars);

		// Copy frequency data to frequencyData array.
		analyser.getByteFrequencyData(frequencyData);

		// Updates bar chart with new data.
		svg.selectAll('rect')
		.data(frequencyData)
		.attr('y', function(d) {
			return height - d;
		})
		.attr('height', function(d) {
			return d;
		})
	}

	renderBars();
}//Close initAudio

//Run initAudio function only after all page elements are loaded.
window.addEventListener('load', initAudio, false);
