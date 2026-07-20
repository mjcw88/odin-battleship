# The Odin Project (Full Stack Javascript) - Battleship
Battleship project for the Odin Project Full Stack Javascript course. This project integrates most of the topics covered in the javascript curriculum so far such as modules, objects, eventlisteners, closure, and BTS traversal for the cpu logic.

Graphical design was mostly inspired by the Gameboy Color game "Battleship".

I may come back to this to add proper graphics for the ships and music and tweak some of the cpu logic.

##### Difficulty CPU logic summary

- ##### Very Easy
  CPU will fire at the board randomly until it finds a hit and then shoot within a 1 tile proximity of each hit until the ship has been sunk.

- ##### Easy
  CPU will fire at the board randomly until it finds a hit and then shoot 1 square around that hit to determine the orientation of the ship and then shoot at either available square in that direction.

- ##### Medium
  CPU will traverse the board to space where the smallest unsunk ship could possibly be and then pick one of those tiles at random to fire at until it finds a hit and shoots 1 square around that hit to determine the orientation of the ship and then shoot at either available square in that direction.

- ##### Hard
  CPU will traverse the board to find space where the smallest unksunk could possibly be and add those to an array, pick one of those spaces at random and then hit the middle tile from that available space of squares. It will continue to do this until it finds a hit and shoots 1 square around that hit to determine the orientation of the ship and then shoot at either available square in that direction.

- ##### Very Hard
  CPU automatically knows where all of all the players ships are and will fire within a 2 square prxoximity of any ship until it finds a hit. Once it finds a hit, the CPU automatically knows the placement of the ship and will continue to fire until the ship is sunk.

Full project specs can be found [here](https://www.theodinproject.com/lessons/node-path-javascript-battleship). 

##### Live Preview
- https://mjcw88.github.io/odin-battleship/