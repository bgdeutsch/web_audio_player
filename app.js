function initAudio(){

	//Establish some variables for later use.
	var audio, seekslider, volumeslider, seeking=false, seekto, 
		current_time_text, duration_time_text, dir, playlist, playlist_index,
		show_playlist, my_playlist;

	
	var play_button    = $('.ion-play'); 
	var pause_button   = $('.ion-pause');
	var stop_button    = $('.ion-stop');
	var volumeslider   = $('#volumeslider');
	var next_button	   = $('.ion-arrow-right-a');
	var prev_button    = $('.ion-arrow-left-a');
	dir 		   	   = 'media/';
	playlist           = ['Solo.mp3','Doubt.mp3','TruthHitsEverybody.mp3', 'Decrescendo.mp3'];
	playlist_index     = 0;
	seekslider   	   = document.getElementById('seekslider');
	current_time_text  = document.getElementById('current_time_text');
	duration_time_text = document.getElementById('duration_time_text');
	show_playlist  	   = document.getElementById('show_playlist');
	my_playlist		   = document.getElementById('my_playlist');


	//Audio object istantiation and options.
	audio = new Audio();
	audio.src = dir+playlist[0];
	audio.loop = false;
	audio.play();
	show_playlist.innerHTML = "Track "+(playlist_index+1)+" - "+ playlist[playlist_index];

	//Hide play button, as the first track plays automatically on page load.
	$(play_button).hide();	

	//Event Handlers
	$(play_button).click(play_audio);
	$(pause_button).click(pause_audio);
	$(stop_button).click(stop_audio);
	$(next_button).click(next_song);
	$(prev_button).click(previous_song);

	//I have experienced some time consuming quirkiness when
	//mixing jQuery with the web audio API.  Switching to native javaScript;
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

	//When user clicks a song title in the playlist,
	//call change_playlist_track function.
	my_playlist.addEventListener('change', change_playlist_track);

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

	//Change song in my playlist according to user interface.
	function change_playlist_track(e){
		audio.src=dir+e.target.value;
		audio.play();
	}

	//Change to next song automatically in playlist when previous song has ended.
	function next_song(){

		//Check to see if the current song is the last in the playlist.
		//If this is the case we can reset the playlist by pointing to the
		//0 index.  If not the last song in the playlist, incremenet the
		//array index by 1.
		if(playlist_index === (playlist.length - 1)){
			playlist_index = 0;
		} else {
			playlist_index++;
		}

		//Update the current song, and play it after switching songs.
		show_playlist.innerHTML = 'Track '+(playlist_index+1)+' - '+playlist[playlist_index];
		audio.src = dir+playlist[playlist_index];
		audio.play();
	}

	//Change to previous song when user clicks back arrow
	function previous_song(){
		if (playlist_index === 0){
			playlist_index = playlist.length - 1;
		}else{
			playlist_index--;
		}

		//Update the current song, and play it after switching songs.
		show_playlist.innerHTML = 'Track '+(playlist_index+1)+' - '+playlist[playlist_index];
		audio.src = dir+playlist[playlist_index];
		audio.play();
	}

	//Play audio.  When audio is currently playing, hide the play button
	//and show the stop button.
	function play_audio(){
		audio.play();
		$(play_button).hide();
		$(stop_button).show();
	}
	
	//Pause audio. When audio is paused, show the play button so the user can
	//play the song when ready.
	function pause_audio(){
		audio.pause();
		$(play_button).show();
	}

	//Stop audio, show play button.
	function stop_audio(){
		audio.pause();
		$(play_button).show();
		$(stop_button).hide();
		audio.currentTime = 0;
	}

	//Volume fuctionality.  The volume property returns a value between
	//0.0 and 1.0; parseFloat lets us work with that.
	function set_volume(){
		audio.volume = parseFloat(this.value / 100);
	}

	//Seek function - on mousemove action on seek slider, skip to 
	//desired time in the song.
	//Seeking is false by default; it will be true only when a user fires a mousedown event
	//and drags the seek slider.  The seek slider's value
	//changes as user drags it.  e.clientX - seekslider.offsetLeft
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
		if(current_seconds < 10)  { current_seconds = '0' + current_seconds; }
		if(current_minutes < 10)  { current_minutes = '0' + current_minutes; }
		if(duration_seconds < 10) { duration_seconds = '0' + duration_seconds; }
		if(duration_minutes < 10) { duration_minutes = '0' + duration_minutes; }

		//Set the currentTime of the song to follow as it plays,
		//and set the duration so user knows how long the song will play.
		current_time_text.innerHTML = current_minutes+':'+current_seconds;
		duration_time_text.innerHTML = duration_minutes+':'+duration_seconds;
	}
} //Closes initAudio function
		
//Run initAudio function only after all page elements are loaded.
window.addEventListener('load', initAudio, false);

