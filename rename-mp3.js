const NodeID3 = require('node-id3');
const fs = require('fs');
const path = require("path")
var recursive = require("recursive-readdir");

const testFolder = '/Volumes/ALLHDAMP3/ALLHDAMP3' // '/Users/oariel/Dev/mp3tag/tests';

console.log('"Artist", "Original Album Name", "Clean Album Name"');   

async function main() {
    var i = 68;
    for (var i =65; i < 91; i++) {
        var letter = String.fromCharCode(i);
        await doLetter(letter);
    }
}


async function doLetter(letter) {
    return new Promise(resolve => {

        var testMode = false;
        var originalTitle = '';
        var cleanAlbum = '';
        var folder = testFolder + '/' + letter;
        var tags = {};
    
        recursive(folder, (err, files) => {
            var lastPath = '';
            var bFirstSong = true;
            files.forEach(file => {
                try {
                    var pathName = file.replace(/\/[^\/]+$/, '');
                    bFirstSong = (pathName !== lastPath)

                    if ( bFirstSong ) {
                        lastPath = pathName;
                        tags = NodeID3.read(file);
                        
                        var album = tags.album;

                        if ( album /*&& album === "Israelites (1969 original US LP) 24-96"*/) {

                            cleanAlbum = '';

                            var parts = album.split(' - ');

                            // Process each part
                            for ( i=0; i<parts.length; i++ ) {

                                // Remove artist name
                                if ( parts[i] === tags.artist ) {
                                    parts[i] = '';
                                    continue;
                                }

                                // Remove year
                                if ( !isNaN(parts[i]) ) {
                                    var year = parseInt(parts[i]);
                                    if ( year > 1900 && year < 2020 ) {
                                        parts[i] = ''
                                        continue;
                                    }
                                }

                                // remove strings contained in brackets of all kinds
                                parts[i] = parts[i].replace(/(\(|\{|\[)[^()]*(\)|\]|\})/g, '');
                                parts[i] = parts[i].replace(/(\(|\{|\[)[^()]*(\)|\]|\})/g, '');

                                // remove certain keywords
                                parts[i] = parts[i].replace(/\b(24|192|88|176|24\-96|2496|96|9624|24bit|96kHz|PCM|aksman|SACD|DVDA|FCG|hdtracks|HiRes|2ch|chw|stereo|Khz|EMI|FLAC|Bit|DVD|HIRESAUDIO|s\-o\-a|VINYL|RIP|NEW\sRIP|MOV|atvr)\b/ig, '');

                                // multiple spaces --> one space
                                parts[i] = parts[i].replace(/\s{2,}/g, ' '); 

                                // Remove spaces, hypens and punctuation at the end of the word
                                parts[i] = parts[i].trim();
                                parts[i] = parts[i].replace(/\s-$/ig, ''); 
                                
                                cleanAlbum += parts[i];
                                if ( i<parts.length-1 )
                                    cleanAlbum += ' '
                            }
                            
                            // We may have over-cleaned
                            if ( !cleanAlbum ) {
                                cleanAlbum = tags.album;

                                // Do some basic leaning
                                cleanAlbum = cleanAlbum.replace(/(\(|\{|\[)[^()]*(\)|\]|\})/g, '');
                                cleanAlbum = cleanAlbum.replace(/(\(|\{|\[)[^()]*(\)|\]|\})/g, '');
                                cleanAlbum = cleanAlbum.replace(/\b(24|192|88|176|24\-96|2496|96|9624|24bit|96kHz|PCM|aksman|SACD|DVDA|FCG|hdtracks|HiRes|2ch|chw|stereo|Khz|EMI|FLAC|Bit|DVD|HIRESAUDIO|s\-o\-a|VINYL|RIP|NEW\sRIP|MOV|atvr)\b/ig, '');
                               
                            }

                            // Final trim
                            cleanAlbum = cleanAlbum.trim();

                            // Everything failed
                            if ( !cleanAlbum )
                                cleanAlbum = album;
                            originalTitle = album;

                            console.log('"' + tags.artist + '","' + album + '","' + cleanAlbum + '"');    
                        }
                    }

                    if ( !testMode ) {
                        console.log("Writing " + file);
                        tags.album = cleanAlbum;
                        tags.originalTitle = originalTitle;
                        var success = NodeID3.update(tags, file);
                        if ( !success )
                            console.log("failed to write ID3 tags to " + file)
                    }

                    
                }
                catch(ex) {
                    console.log(ex);
                    return resolve(false);
                }
            });

            return resolve(true);
        })

    });
}

main();

