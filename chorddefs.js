/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * (c) 2018 Renee Waverly Sonntag
 */

// Scales
var scales = {"major":{}}
scales.chromatic = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"]
scales.major.C = ["C","D","E","F","G","A","B"]
for (var i = 1; i < scales.chromatic.length; i++) {
   scales.major[scales.chromatic[i]] = sharp(scales.major[scales.chromatic[i-1]])
}

/**
 * Takes an individual note and makes it sharp, or takes a scale and sharps every note.
 */
function sharp(note) {
   if (!Array.isArray(note)) {
      var index = scales.chromatic.indexOf(note)
      if (index < 0) throw "Invalid Note: " + note
      if (index == scales.chromatic.length - 1) index = -1
      index++
      return scales.chromatic[index]
   } else {
      var newscale = []
      for (var i = 0; i < note.length; i++) {
         newscale[i] = sharp(note[i])
      }
      return newscale
   }
}

/**
 * Takes an individual note and makes it flat, or takes a scale and flats every note.
 */
function flat(note) {
   if (typeof note != "Array") {
      var index = scales.chromatic.indexOf(note)
      if (index < 0) throw "Invalid Note: " + note
      if (index == 0) index = scales.chromatic.length
      index--
      return scales.chromatic[index]
   } else {
      for (var i = 0; i < note.length; i++) {
         note[i] = flat(note[i])
      }
   }
}

/**
 * Takes a scale, and creates a chord (major)
 */
function /* class */ chord(scale) {
   if (Array.isArray(scale)) {
      this.scale = scale
      this.name = scale[0]
      this.notes = [scale[-1+1],scale[-1+3],scale[-1+5]]
   } else if (typeof scale == "object") {
      this.scale = scale.scale
      this.name = scale.name
      this.notes = []
      for (var i = 0; i < scale.notes.length; i++) {
         this.notes[i] = scale.notes[i]
      }
   } else if (typeof scale == "string") {
      this.scale = scales.major[scale]
      this.name = scale
      this.notes = [this.scale[-1+1],this.scale[-1+3],this.scale[-1+5]]
   }
   return this
}

chord.prototype.toMinor = function() {
   this.name += "m"
   this.notes[1] = flat(this.scale[-1+3])
   return this
}

chord.prototype.susFour = function() {
   this.name += "(sus4)"
   this.notes[1] = sharp(this.scale[-1+3])
   return this
}

chord.prototype.toSeven = function() {
   this.notes.push(flat(this.scale[-1+7]))
   var indexend = this.name.indexOf('(') > -1 ? this.name.indexOf('(') : this.name.length
   this.name = this.name.slice(0,indexend) + "7" + this.name.slice(indexend)
   return this
}

chord.prototype.toMajorSeven = function() {
   this.notes.push(this.scale[-1+7])
   var indexend = this.name.indexOf('(') > -1 ? this.name.indexOf('(') : this.name.length
   this.name = this.name.slice(0,indexend) + "M7" + this.name.slice(indexend)
   return this
}

chord.prototype.toSix = function() {
   this.notes.push(this.scale[-1+6])
   var indexend = this.name.indexOf('(') > -1 ? this.name.indexOf('(') : this.name.length
   this.name = this.name.slice(0,indexend) + "6" + this.name.slice(indexend)
   return this
}

chord.prototype.augFive = function() {
   this.notes[2] = sharp(this.scale[-1+5])
   this.name += "(aug5)"
   return this
}

chord.prototype.dimFive = function() {
   this.notes[2] = flat(this.scale[-1+5])
   this.name += "(dim5)"
   return this
}

chord.prototype.noFive = function() {
   this.notes.splice(2,1)
   this.name += "(no5)"
   return this
}

chord.prototype.noThree = function() {
   this.notes.splice(1,1)
   var indexend = this.name.indexOf('(') > -1 ? this.name.indexOf('(') : this.name.length
   this.name = this.name.slice(0,indexend) + "(no3)" + this.name.slice(indexend)
   return this
}

function reverseChord(notes) {
   var answers = []
   var collection = []
   // Generate a list of chords
   // with roots being the notes in the argument
   if (notes.length === 2) {
      // Generate a list of chords using the notes in "notes" as the roots.
      for (var i = 0; i < notes.length; i++) {
         // Chords with two notes.
         // 1 [(3 || b3 || #3) || (5 || 5b || #5)]
         collection.push(new chord(notes[i]).noFive())
         collection.push(new chord(notes[i]).toMinor().noFive())
         collection.push(new chord(notes[i]).susFour().noFive())
         collection.push(new chord(notes[i]).noThree())
         collection.push(new chord(notes[i]).dimFive().noThree())
         collection.push(new chord(notes[i]).augFive().noThree())
      }
   } else if (notes.length === 3) {
      for (var i = 0; i < notes.length; i++) {
         // Chords with three notes.
         // 1 (3 || b3 || #3) [(5 || b5 || #5) || (6 || 7 || M7)]
         var majmin = [new chord(notes[i]), new chord(notes[i]).toMinor(), new chord(notes[i]).susFour()]
         for (var j = 0; j < 3; j++) {
            collection.push(new chord(majmin[j]))
            collection.push(new chord(majmin[j]).dimFive())
            collection.push(new chord(majmin[j]).augFive())
            collection.push(new chord(majmin[j]).toSix().noFive())
            collection.push(new chord(majmin[j]).toSeven().noFive())
            collection.push(new chord(majmin[j]).toMajorSeven().noFive())
         }
      }
   } else if (notes.length === 4) {
      for (var i = 0; i < notes.length; i++) {
         // Chords with four notes.
         // 1 (3 || b3 || #3) (5 || b5 || #5) (6 || 7 || M7)
         var majmin = [new chord(notes[i]), new chord(notes[i]).toMinor(), new chord(notes[i]).susFour()]
         for (var j = 0; j < 3; j++) {
            var fourths = [new chord(majmin[j]), new chord(majmin[j]).toSix(), new chord(majmin[j]).toSeven(), new chord(majmin[j]).toMajorSeven()]
            for (var k = 0; k < 4; k++) {
               collection.push(new chord(fourths[k]))
               collection.push(new chord(fourths[k]).dimFive())
               collection.push(new chord(fourths[k]).augFive())
            }
         }
      }
   }
   // Filter the list such that only chords containing all of the notes in the argument remain.
   for (var i = 0; i < collection.length; i++) {
      if (arraysEqual(collection[i].notes, notes)) {
         var name = collection[i].name
         var chordname = name[0]
         if (notes[0].length > 1) { chordname = name.substring(0,notes[0].length) }
         if (chordname != notes[0]) name += "/" + notes[0]
         answers.push(name)
      }
   }
   return answers
}

function arraysEqual(_arr1, _arr2) {
   if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length) return false
   var arr1 = _arr1.concat().sort()
   var arr2 = _arr2.concat().sort()
   for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false
   }
   return true
}
