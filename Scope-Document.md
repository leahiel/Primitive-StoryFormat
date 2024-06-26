### Project TODO:
Test Control flow with `<<set>>` macros within the blocks.


# Primitive Scope Document
A Twine-to-EPUB IF StoryFormat.

<details>
  <summary>Table of Contents</summary>

  * [Version Plans](#version-plans)
    * [Version 0.1](#version-01)
      * [0.1 Features](#01-features)
      * [0.1 Technical Notes](#01-technical-notes)
      * [0.1 Author Experience](#01-author-experience)
    * [Version 0.2](#version-02)
      * [0.2 Features](#02-features)
      * [0.2 Technical Notes](#02-technical-notes)
      * [0.2 Author Experience](#02-author-experience)
    * [Version 0.3](#version-03)
      * [0.3 Features](#03-features)
      * [0.3 Technical Notes](#03-technical-notes)
      * [0.3 Author Experience](#03-author-experience)
    * [Feature Creep](#feature-creep)
      * [Creep Features](#creep-features)
  * [Glossary](#glossary)
  * [Notes from Gamebook Playthroughs](#notes-from-gamebook-playthroughs)
  * [Helpful Links](#helpful-links)
</details>

# Version Plans:
~~4) A Table of Contents, generated for each passage, should be available in both EPUB and HTML style.~~

~~**RESEARCH:** Should "Chapters", as a whole, be added? Having a link for each Passage in the Table of Contents may be extreme. Consider "Our Cabin Was Cold", which has 92 "Generated" Passages, but only 8 Chapters.~~
**ANSWER:** This would conflict with the planned Mermaidization of Version 0.2. EPUBs will generate what they need, but for HTML the issues are high, and largely, unneeded. That's not to say that this cannot be done, but that they should be done after Version 0.2, perhaps Version 0.4.

5) A configuration file for Primitive's use.
* 5a) A direct-to-EPUB option or direct-to-HTML option.

**TECHNICAL:** This would act as if the user simply presses that associated button to generate the EPUB or HTML document on story load.
* 5b) Regarding `(turn to n)`:
* * 5ba) Should be able to customize the `(turn to n)`  text.
* 5c) The ability to disable HTML hyperlinks from appearing.

**NOTE:** Required in case authors want to attempt print versions of their stories based on Primitive.

11) Separate CSS files should be accepted for each exported version that Primitive Offers.
* 11a) A CSS file or Special Passage for HTML exports.
* 11b) A CSS file or Special Passage for EPUB exports. 
NOTE) We don't want people to submit stylesheets as those can be difficult to disable manually. 
TECHNICAL) We should find a way to add an attribute to every element depending on whether it's CSS or HTML. Then we can parse though the Special Passages' CSS and add that attribute to every selector there, to ensure that EPUB and HTML don't mix.
-- Actually, that's silly. We should just add that attribute to the top level node, and then we can add `top-level-node[type='html/epub']` to the beginning of every selector.

13) I need a way to set the visible title of a Passage for front and back matters.
NOTE) Shuffled passages would just have their generated number.



### 0.1 Technical Notes:
Primitive can be broken down, very roughly, into a few parts in this version: The parser, the export options page, the HTML export, and the EPUB export. 

Because exporting to EPUB is the most critical feature of Primitive, all considerations should be made in regards to this. For instance, when parsing the Twine HTML story data, line breaks should be removed and each paragraph should be placed within a `<p>` HTML element.

There's a lot of adding Custom Attributes to HTML Elements. TME suggested that it may be wise to give these Custom Attributes a prefix, so that they don't interfere with feature Twine attributes.



### 0.1 Author Experience:
The Author will be able to write their story in a series of Passages using Twee syntax. To link between Passages, they may use Passage Link Syntax. Primitive will automatically convert Passage Link Syntax into hypertext links with optionally added `Turn to Passage N` text added to the Passage. This will allow Readers to navigate between Passages with ease on their eReader.

After writing their story, Authors may use the Primitive StoryFormat to view an HTML page that has three options on it, an option to `Export to EPUB`, `Export to HTML`, or to `Test HTML Version`.

Should `Export to EPUB` be selected, a conversion of the Passages will be started which results in an EPUB file being downloaded to the Author's computer system. This file will be their Story in EPUB format, which they can then provide to their Readers for their Readers to enjoy.

Should `Export to HTML` be selected, a conversion of the Passages will be started which results in an HTML file or a ZIP file being downloaded to the Author's computer system. The HTML file (or the HTML file once unzipped) may be played in a Reader's browser for their enjoyment.

Should `Test HTML Version` be selected, the StoryFormat will launch into a playable version of the HTML version of the Story for the Author to browse.



## Version 0.2:
Version 0.2 plans to add extensive additions to Primitive in order to truly make it an Interactive Fiction authoring tool. The primary functionality of 0.2 features around making a functional divergent novel format. Authors will be able to keep track of their State of their story, by initializing and then setting nullable booleans, hereby called State Variables. Authors will be able to use these State Variables to write `if statements` into their stories, which will result in their story passages diverging. Primitive will then create each possible variation of the passage for each State possible up to that passage. This means that readers will not need to keep track of their State while reading the story, while still providing them with a story unique to their specific choices.



### 0.2 Features:
1) State Tracking Feature, requiring:
* 1a) An initialization Special Passage, whereby all nullable booleans can be initialized.
* 1b) A `<<set>>` and `<<unset>>` macro, whereby nullable booleans can be set to true, false, or unset.

**TECHNICAL:** The current idea for State Tracking is to assign the variables to the Generated Passage Name. So, a Generated Passage Name may be something like `18-NN10N10N`, where `18` represents the Generated Passage Name, and `N`, `1`, `0` represent the value of the corresponding State Variable for that generated passage.

* 1c) While the Generated Passage Name of a passage may change, the "turn to" text that the reader sees should still read as something like, `(turn to 82)`, NOT something like `(turn to 82-NN10)`.

**TECHNICAL:** There are currently two ideas on how to implement `<<set>>`ing State Variables
* * One: State Variables can be used with a `<<set>>` and `<<unset>>` macro, ensuring that whenever a reader visits that passage, that State Variable will be updated.
* * Two: State Variables can be updated on Passage Transition via a customized Passage Link Setter. This may be more logical, but the chance for authors to make an error is higher. For instance, if Passage A, B, and D converge on Passage E, then the author has to remember to set the State Variable in all three passages. If they forget one, they could have an unexpected error on Passage E.

* 1d) An error should be flagged if a State Variable does not exist when being used in a `<<set>>`, `<<unset>>`, or `if statement`.

**NOTE:** `<<set>>` and `<<unset>>` macros are not planned to be compatible inside an `if statement`.

2) `If Statements`, in order to actually utilize State Variables, `If Statements` using those State Variables may be made. If Statements will hide 

3) Mermaid.js allows for a Flow Chart to be made in a markdown-like text. Even better, one can be dynamically drawn on screen. Such a feature will be critical for authors to ensure that they have not made any errors with their State Variables.

**NOTE:** Mermaid.js can be found on https://mermaid.js.org/

**RESEARCH:** As Mermaid will prepare a mark-down like list of Passage Links, it may be useful to incorporates it as a part of the Passage Generation feature. We could use Mermaid pre-Passage Generation to determine Passage Link Loops and Passage Link Returns, which may or may not need special handling in the Passage Generation phase.
    Mermaid markdown for a Passage Link Return would look like this:
        `2-N --> 3-N --> 2-N `
    Mermaid markdown for a Passage Link Loop would look like this:
        `1-N --> 2-N --> 3-N --> 1-N`
There isn't too much difference between a Passage Link Return and a Passage Link Loop, but the distinction is made here in case it needs to be made within the technical aspects of the project.

**TECHNICAL:** For each new Link Connection added to the Mermaid Flow Chart, we should crawl through all Link Connections. If we find an exact match, then we know we have hit a loop, and can termination that path, preventing us from crawling forever.

* 3a) The Flow Chart will require a table of contents, so that authors know which original passage is referred to in each box of the Flow Chart.

* 4) Cover Special Passage where a user can put an image of their cover, which Primitive will use in the EPUB.


### 0.2 Technical Notes:
Frontmatter and Backmatter passages cannot use or have this State tracking feature. For instance, there should be no way for two Introduction passages to exist. Therefore, these passages must generate an error if there are macros in them.



### 0.2 Author Experience:
In addition to the 0.1 Author Experience, Authors will now be able to use State Variables in their stories. This will allow them to make minor changes within Passages to address those chosen State Variables. I.e., should a Reader decide to go to a Passage which sets a State Variable regarding them to wear a dress as True, then the Reader will be able to read future Passages that take that fact into account. The Reader will not have to keep track of their State (In this case, the fact that they are wearing a dress.) themselves, instead Primitive will automatically hide all `if statements` that require that State Variable to be False from the Reader.

Additionally, Authors may place Passage Links within If Statements, resulting in those Passage Links only appearing if the Reader has the required State necessary.

This feature may cause unintended dead ends. Because of this, on the screen that shows the three Export options, an SVG Flow Chart made by Mermaid.js will be shown that Authors can view in order to verify that they haven't made any errors within the If Statements of their story.



## Version 0.3:
Rather than add new features, version 0.3 is about enhancing what already exists. Changes to reduce the number of generated passages, validating EPUB CSS, and other small enhancements will occur at this time.



### 0.3 Features:
1) State Pruning. Primitive will automatically assign State Variables to be null if all possible future passages do not use that State Variable. This will result in a reduced amount of passages in the final product, and therefore smaller data sizes and, possibly, the potential for a print export under very carefully managed circumstances by the author.

2) Two word and passage counters that do and do not consider the additional generated passages should be available.

3) Basic CSS validation that is compatible with EPUB 3 standards.

**NOTE:** While CSS support will always have been available up to this point, it is here that authors will be able to provide a different CSS sheet for each anticipated export factor.

* 3a) Separate and validate the EPUB CSS support.
* 3b) Separate and validate the HTML CSS support.

**QUESTION:** While we must validate EPUB CSS support, does HTML really need to be validated?

4)  Basic HTML validation that is compatible with EPUB 3 standards.

**NOTE:** Not every standard HTML element is available with EPUB 3 standards, so verifying them would be wise.

5) EPUB files should be able to be read in-browser.

**TECHNICAL:** There are a few JavaScript libraries available for this. One such one is https://github.com/futurepress/epub.js/

6) [HTML] Images should be loaded as they are scrolled into view, in order to prevent large loading times for the story.

**NOTE:** All known EPUB readers handle this automatically.

7) The EPUB should conform to the Amazon Kindle Previewer: https://kdp.amazon.com/en_US/help/topic/G202131170 and Kindle Create: https://www.amazon.com/Kindle-Create/b?ie=UTF8

**TECHNICAL:** We would actually want to output a DOCX for Kindle Create, which is something Pandoc can do. This will allow authors to change their novels with that tool, instead of relying on Primitive.

**NOTE:** For Print (NOT Kindle Create), we'd want to allow PDF and/or DOCX that have page numbers, and update the "turn to Passage N" text to "turn to Page N".



### 0.3 Technical Notes:
`~~~`


### 0.3 Author Experience:
The Author Experience for the 0.3 version of Primitive will not change very much. The biggest factor will be an EPUB CSS validator, which will ensure that custom EPUB CSS, which shouldn't be going crazy anyways, will be properly handled. Should the Author add some CSS which is not valid in the EPUB 3.3 standard, Primitive will warn the Author of this in the "Export" options screen.

The Author will be forced to use Primitive for the whole building tool especially in regards to self-publishing on Amazon.

In addition, the Author will be able to read the EPUB version of their story in their browser, which will save some time from having to download the EPUB and then read it on another software (e.g. Calibre) or hardware (e.g. a mobile device).

Lastly, some minor statistics about their story will be shown on the "Export" options screen.



## Feature Creep:
Feature creep refers to the excessive ongoing expansion or addition of new features in a product, which results in delayed, abandoned, and/or over-complicated projects. In an effort to prevent feature creep, ideas that are deemed as requiring considerable amounts of time, having issues with implementation, or are out of scope to the idea of Primitive are stored here. These may be added to the roadmap for a future version of Primitive when it is appropriate.

Some features listed here are completely feasible, but have not been integrated into a Version yet.



### Creep Features:
1) Export to:
* 1a) Print 

[Creep because Version 0.2 of Primitive will massively expand passage count, which would in turn expand the page count of a book to unrealistic proportions.]
* 1b) PDF 

[Creep because Gordian Book will likely be able to handle this out of box.]

2) The StoryFormat should change the base Twee files to add an `alias` metadata property to the Passage Headers, so that authors can see what State Variables the StoryFormat expects to be used at that point in the story.

**TECHNICAL:** This would prove to be very tough to do for two reasons:
* First, StoryFormats take a Twine 2 document and act on that. They do not take Twee files and act on that, so the base Twee files would not be available for Primitive to act on.
* Second, how would the alias name actually look? `"alias":"78-110NNN"` would be the same as `"alias":"78-110NNN"`. Perhaps a different letter, like `U` could be used to indicate that that State Variable is "Used", but it's not looking like a great idea in actuality.

3) Templates, a.k.a., text replacement markup. See SugarCube's documentation on this feature: https://www.motoslave.net/sugarcube/2/docs/#markup-template

**TECHNICAL:** Because each Template would need to be expanded differently, this could be analogous to tracking the State of a string variable. Nullable Booleans were chosen as the Type of State Variables to limit authors from wantonly expanding their story beyond reason.

4) "Return to" functionality, wherein a "return to #" link can be added.

**NOTE:** This would have to be a custom link syntax of some sort.

**TECHNICAL:** Primitive will not be tracking History, only current State. It is possible for several Generated Passages to link to one Generated Passage. The unreasonable alternative to the Note would be to keep track of every passage visited on passage transition, but then Primitive stories would reach millions of Generated Passages incredibly fast.

5) Passage Link Self-Loops are passages that loop to themselves. They would look like this in Mermaid markdown:
    `1-N --> 1-N`
As there are no plans to allow `<<set>>` and `<<unset>>` statements to be made within `if statements`, there is no special support for this. That means that Passage Link Self-Loops have no reason to exists, as once set, State Variables cannot be changed if you continue going to the same passage.

6) Integer State Variables. [GAMEBOOK]

**TECHNICAL:** Adding and subtracting Integer State Variables, and using them in If Statements wouldn't be hard. The only notable thing is that Primitive would have to have the Author give us the possible maximum and minimum values for each Integer State Variable. However, I'm not sure how the technical portion of adding Integer State Variables would work. i.e. How would Primitive keep track of them in the Generated Passage Names? Perhaps Primitive could do something like `::P-ISV1-ISV2-ISV3-NBSVs`.

7) Hotkeys used as passage progression for HTML versions of the game.

**NOTE:** This would allow for automated testing using non-standard means (e.g. AutoHotkey) much easier.

**TECHNICAL:** I'm just not sure how Primitive would do this. Should there be JavaScript that changes the current set of Hotkeys based on which passage you're on? But I'm not planning on tracking current HTML passage thingy. Perhaps Primitive could add this along with a second optional variation of HTML that shows passages one at a time?

8) Horizontal Rules.

9) A Return Macro. [GAMEBOOK]

**NOTE:** Imagine a scenario wherein the Author places a link to the inventory at the top of every passage. Rather than having to write a massive If Statement for every passage that links to the inventory, they could just write a `<<return>>` macro instead, which would tell the reader to return to the passage that they just came from (of course, giving them that number too).

**TECHNICAL:** EPUB and EPUB-RS specifications have no "back" button, as you may find on a browser. Such an idea must be programmed by myself.

10) Automatic Passage Forwarding and/or Redirect Passages

**NOTE:** See section at bottom of GameBook section.

11) For a better Author Experience, setting NBSV may be able to be able to be done automatically. For instance, if there is a Source Passage with a macro, say `<<take SPADE>>` in it, then multiple passage links should be generated. Currently, every Source Passage Link results in one Generated Passage Link, but this feature would change that rule.
Example:
```
:: StoryVariables
SPADE;

:: Source
<<take SPADE>>
You are in a field, there's a spade here.

You decide to head [[north]]

:: Generated
You are in a field, there's a spade here.

You take the spade and you decide to head [[north]]
You leave the spade and you decide to head [[north]]
```

**NOTE:**
Multiple `<<take>>` in the Source Passage [n] would result in Generating Passage Links on a 2^n basis. Adding in the potential for multiple Passage Links in the Source Passage [m] would result in the total Generated Passage Links being m*(2^n).

**TECHNICAL:** 
1) Since SPADE would be the technical term, how would Primitive know which form to use in the Generated Passage Link? The Author may desire `SPADE` as the technical term, but `shovel` as the term used in their passages at some points, and `blunt metal object on stick` at others. This could be resolved, at least partially, with a Template system, but that feature also has its issues.
2) How would we customize the wording in the Generated Passage Links? No other feature in Primitive changes any of the wording of Source Passages, so this would be quite an unusual addition. Perhaps instead of `You take the spade and you decide to head [[north]]`, it would be, `You take the spade. You decide to head [[north]]`, but even in this case, Primitive would have to determine the best place to place "You take the spade."
Perhaps something like:
```
:: Source
<<take SPADE FORK>>
You are in a garden shed, with a spade and a fork hanging on the wall.

You [choices] decide to head [[north]]
```
Exact generated wordage of `[chioces]` would need to be determined.

12) Allow passage links to use mermaid formats like -->, -.->, ---, ==>, ~~~


# Glossary:
### Author / Developer / Programmer / Writer
The person writing the story.

### Back Matter
### Body Matter / Shuffled Matter
### BBCode
### EPUB
### EPUB-RS
### Front Matter
### Gordian Book
### HTML
### IF/Interactive Fiction
### If Statement
### "Macro"
### Markup
### Mermaid
### Nullable Booleans
Booleans are variables that can either be True or False. Nullable Booleans can also be Null. Nullable Booleans are used as State Variables, with which the Author can 

### Passage
### Passage Generation
### Passage Link Loop
### Passage Link Return
### Passage Link Self-Loop
### Passage Link Syntax
### Passage Name
### Passage Originals
### PDF
### Primitive
### Reader/User
### SemVer/Semantic Versioning
### Set Macro
### State
### State Variables
### Story
### StoryFormat
### Table of Contents
### Templates
### Twee
### Twine
### Twine 2 HTML Document
### Twine 2.x Application
### Unset Macro



# Notes from GameBook Playthroughs
GameBooks Played: 
* "Escape from the Tower of Stars" by David Donachie
* "And Watch the Skies be Torn Asunder" by Steffan Hagen    

Find them on <https://www.lloydofgamebooks.com/p/voting-is-now-open-for-20222023.html>

> There are three main state variables used in these GameBooks: Keywords (literally Booleans), items (Booleans or Integers), and rolling dice (verboten, literally cannot be supported in an EPUB setting).

> Values of items (such as 10gp, 3 rations, 2 medkits, etc) wouldn't be easily checked. This would require Integer State Variables, which are currently a Creep Feature, and thus are not currently planned to be added.

> However, with some alterations, there doesn't seem to be anything beside the rolling of the dice that would prevent a porting of "Escape from the Tower of Stars" from being ported to the planned 0.2 version of Primitive.

> A way to track your skills, inventory, and stats would be required. Perhaps David would have to have a "check your skill and inventory" line that leads to a "Stats and Inventory" passage with a lot of If Statements that would report those stats. While non-trivial, this wouldn't exactly be difficult.

> The issue here would be the "return" link. Because readers are not expected to keep track of their current passage number, that link would be unique to each passage that could lead to it. That means that each passage of inventory checking isn't only duplicated based on the actual stats of the reader, but also based on where the reader got to the passage from. 

> So if David has 300 permutations of stats and items in his story (keywords would be natively tracked by the boolean system, but if he wanted to show those too, then that could add more permutations), and 60 passages that allow the reader to see their stats and items, then that is 300 * 60 = 18000 generated unique passages to be added. Feasibility studies on this massive passage count would need to be considered. Additionally, if I wanted this sort of thing to be possible, I would need to look into a `<<return>>` sort of macro. At the moment David would have to link to a different stats and items passage for every passage, which is ridiculous.

> "And Watch the Skies be Torn Asunder" managed health by having the player track the number of times they have been WOUNDED. This would be able to be done in Version 0.2, wherein the NBSVs WOUNDED_1, WOUNDED_2 could be used. The author would still need to say something like:
> ```
> <<if WOUNDED_2>>
>     [[death]]
> <<else if WOUNDED_1>>
>     <<set WOUNDED_2 to true>>
>     Rest of Passage Text. 
> <<else>>
>     <<set WOUNDED_1 to true>>
>     Rest of Passage Text. 
> <</if>>
> ```

> Unfortunately, this would require duplicating "Rest of Passage Text". This is undesirable, so some thought needs to be taken. Perhaps an `<<include>>` macro may wise?

> One solution from Hituro would be to advise the author to write it like this:
> ```
> :: Injury
> <<if WOUNDED_2>>
>     [[die]]
> <<elseif WOUNDED_1>>
>     <<set WOUNDED_2>>
>     [[hurt]]
> <<else>>
>     <<set WOUNDED_1>>
>     [[hurt]]
> <</if>>
> ```
> And then have something like "Automatic Passage Forwarding" or "Redirects" to take the reader to the correct place. I think this invites complexity on both the technical part of the Engine (as such a thing would need to be programmed) and on the part of the Author, as they now have a new tool/technique that they need to learn and contend with.



# Helpful Links:
#### Twee 3 Specification:
https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md

#### WritingFantasy Guide:
https://sophiehoulden.com/twine/writingfantasy_guide.html

**NOTE:** Without a license or copyright information, the code of Writing Fantasy is verboten to copy/gain inspiration from.

#### Paperthin Proofing StoryFormat:
https://github.com/klembot/paperthin 

#### The EPUB3 specification:
https://www.w3.org/TR/epub/

#### The EPUB3-RS specification: 
https://www.w3.org/TR/epub-rs/

#### The Official EPUBCheck project:
https://github.com/w3c/epubcheck
https://github.com/w3c/epubcheck/wiki

#### Amazon Kindle Create:
https://www.amazon.com/Kindle-Create/b?ie=UTF8

#### Amazon Kindle Previewer: 
https://kdp.amazon.com/en_US/help/topic/G202131170

#### Link to the Twine 2.x Application on Parsing Links:
https://github.com/klembot/twinejs/blob/develop/src/util/parse-links.ts
