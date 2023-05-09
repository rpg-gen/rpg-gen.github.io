next

- [ ] Enable: Add ability to character
- [ ] Enable: Remove ability from character
- [ ] Enable: Browse all abilities

backlog

- [ ] Change item generator to instead just be attributes (without trying to conjugate). Separate feature, attributes could be tied to place, or person, or event, etc.
- [ ] Change character list styling. No banded color alternating. Instead have each character single color, with white between. Same for
- [ ] Make "enter" create new item, not drop item. And clear out item field
- [ ] Add ability to edit an item in the character list
- [ ] Add ability to specify which item is "held" and have it show up in the main bar
- [ ] Make short name appear on bar instead of full name
- [ ] Add numbers to items so you can track
- [ ] Make clicking on character row open the dropdown, instead of just the dropdown arrow (but leave that also)
- [ ] Break out character creation to it's own page, so you can have descriptions from the guide book, more of a wizard style
- [ ] Ability to change order of items in a character list
- [ ] Firebase error - Quota Exceeded
- [ ] Handle the quota exceeded error
- [ ] Put the item generation behind the authentication
- [ ] Have the randomizer limit reads and writes by using uploaded files instead of firestore
- [ ] Have logging out empty the user state (so that they don't still have a proper token to submit)
- [ ] Have clicking on the title also close the sidebar
- [ ] Fix the Accountinfo page on login not maintaining the banner, and it should redirect to the main landing page after login?
- [ ] Upload characteristics list
- [ ] Add item generator to the gen page
- [ ] Get basic character list showing
- [ ] Add a "Logged in" message after successful login, and update to use the new banner settings
- [ ] Add a "clear" button to the banner to get rid of it without having to change pages
- [ ] Add a background to the banner message so it shows up more clearly
- [ ] Add a way to add in the character descriptions for the different classes
- [ ] Use Gimp to clean up the favicon, make it transparent
- [ ] Add "advanced" dropdown to hide the item generation settings by default
- [ ] Add ability to re-generate each of the pieces individually
- [ ] Add tags for ability, vs description
- [ ] Generate the rarity (with a weighted chance or assigning that (or weighted chance of assigning more attributes, based on rarity))
- [ ] Figure out a rarity slider scale (like if fighting a boss, or just looting a random house)
- [ ] Item tagged by size, circumstances found in
- [ ] Common notes section, relevant to campaign
- [ ] Place for links, like to maps, boards, etc
- [ ] Dice roller on the character page
- [ ] Item generator and tracker
- [ ] NPC generator and tracker
- [ ] Realtime combat updates, HP, items, AP
- [ ] Dungeon generator and tracker
- [ ] enemy and combat tracker
- [ ] player character tracker
- [ ] Ability to report a bug, logs to a firebase collection, so I can make note of bugs while I'm using the app without having to be on my computer or have the stuff up
- [ ] Make new character update the local list, when you go back, without having to fetch all
- [ ] make each row check state tonsee if it needs rk send the flash effect, or just prolong current
- [ ] make the charactder list ordered, with any "owned" character at the bottom
- [ ] links to maps
- [ ] Website roll functionality with output meaning
- [ ] Add or remove potential item slots
- [ ] item slots link to item description page
- [ ] Make text area max width of details area
- [ ] Add general description, flaw, ideal, race to character fields
- [ ] add ability to regenerate any part pf phrase after generation
- [ ] Not properly excluding past attribute groups in the suffix prefix
- [ ] Add display to show counts of each item, attribute, power, etc
- [ ] Make three attributes less common
- [ ] The back arrow on the mobile version sidebar takes a second to show up, so there's blank space; for a second which looks bad
- [ ] Item that grants AP if used in certain way
- [ ] Summer, winter, sprint, fall


2023-03-30

- [x] BUG when logging in the characters don't reload right away, you have to reload. Need to fix this
- [x] Fixed bug where with data spoofing and a character didn't have items, the item array would break

2023-03-14

- [x] Fix issues with calling global context (like for sidebar) that don't exist anymore

2023-03-13

- [x] Add collection with single tracking document that indicates when it's time to reload characters
- [x] Add confirmation on item drop
- [x] Add race, flaw, ideal fields to character description

2023-03-12

- [x] When a character is deleted, fix error that shows up when trying to edit character on a non-refreshed other browser window

2023-02-23 - Added
- [x] Pull the character the first time the characters page is clicked on, but don't lose if you move to another page and then come back
- [x] Make the character listener listen to a query, to pick up deletes and new charaters without having to set up new listeners. Will need to test to make sure it can work this way


- [x] 2023-01-30 Make sure the page goes to the right page on reload, preserves state
- [x] Look into react rules for Forms
- [x] Hide login form when logged in, replace with logout button
- [x] Get Firebase authentication working for a single user
  - [x] Login
  - [x] Logout
- [x] Figure out data CRUD operations
  - [x] Loading data
  - [x] Adding data
  - [x] Deleting data
  - [x] editing data
  - [x] Firebase cloudstore rules
- [x] Hide most of menu and details pages when not logged in
- [x] Get mobile layout view working
- [x] Fix the orange links
- [x] Set up the banner
- [x] Make the border move to the bottom on mobile screens
- [x] Get mobile menu to hide and re-show with button
- [x] 2023-02-06 - Create a build script to easily build and copy the dist folder
- [x] 2023-02-06 - Make titles line up on mobile sidebar open - NOT GOING TO DO
- [x] 2023-02-06 - Add die roller option to select D setting
- [x] Fix width issue when the context is really long in the details - should not change the sidebar size (static sidebar size on non-mobile?)


# Item generator features to build
- [x] Add suffix and prefix tags
- [x] Allow 2-attribute gens to be in second half and not always split
- [x] Setting full weight on 1 attribute doesn't always include 1 attribute
- [x] Build out specific structure generator
- [x] Add power generator
- [x] Make sure the "the" check is looking for a space after the "the" word so it doesn't match words that begin with T H E
- [x] Output name proper wrapping with "A" vs "An"
- [x] How to add "Set of" when "A" is picked, but item is plural (A brazen leggings, vs the leggings of malice, etc)
- [x] Able to add "the" before the suffix, and have the suffix_prefix inject after the "the" instead of before
- [x] Add a "The/a/an" picker on the specific structure page
- [x] Allow to pick number of abilities
- [x] Have the powers generated separately
- [x] Another prefix to the suffix (low chance)
- [x] Checkboxes to pick if it's suffixes, prefixes, etc
- [x] Or uncheck all boxes just to get a regular item
