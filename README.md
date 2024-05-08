# Primitive
*A StoryFormat for [Twine](<https://twinery.org/>) for Print viable Interactive Fiction.*

Primitive allows authors to read paper-ready Interactive Fiction stories, while being able to keep track of player choices.

## Testing and Exporting Stories
Primtive allows you to test and export your Twine story by clicking the extremely prominent `Test HTML`, `Export HTML`, and `Export EPUB` buttons.

# Usage
## Mandatory
### Start Special Tag
Once the Primitive StoryFormat is installed, you must tag a passage with the `Start` special tag:
```
:: First Story Passage [start]
```
This should be your first story passage that occurs after the introduction of your story. This will allow Primitive to use this passage to begin crawling through all passages that are able to be reached from this first passage.

### StoryVariables Special Passage
If you want to use NBSV (nullable boolean state variables) im your story, you will need to initial them in a `:: StoryVariables` special passage. Simply place one variable per line.
```
:: StoryVariables
VariableOne
VariableTwo
SpecialMonkeyVariable
```
All variable start as `null`. Be sure to `<<set>>` your variables to your deserible value in your first passage if you want them to begin as a different value.

## Passage Links
**WIP:** Need to reintegrate.

You can link from one passage to another with the following syntax:
* a) `[[Passage Links]]` => `Passage Links (turn to 6)`
* b) `[[display text->Passage Link]]` => `display text (turn to 6)`
* c) `[[Passage Link<-display text]]` => `display text (turn to 6)`
* d) `[[->Passage Link]]` => `(turn to 6)`
* e) `[[Passage Link<-]]` => `(turn to 6)`
* e) `[[#->Passage Link]]` => `6`
* g) `[[Passage Link<-#]]` => `6`

### Custom Passage Links
**WIP:** Currently putting title instead of passage number.

You can make your own passage title by assigning a `link-affixes` in your `:: StoryConfig`:
```
:: StoryConfig
{
    "link-affixes" : {
        "turnto": "Turn to %n"
    }
}
```
The `key`, in this case, `turnto` sets the code that you write into your passages. Primitive will turn the code into a custom passage link, replacing it with `Turn to Passage 23`.

## Macros
### <\<Set>>
**WIP:** Need to ascertain `<<set>>` within control flow macros.

You can `<<set>>` your variables to change them from their previous value to their new value. You may assign a value of `true`, `false`, or `null`, to your NBSV.
```
:: ExamplePassage
<<set SpecialMonkeyVariable true>>
<<set VariableTwo null>>
<<Set VariableOne false>>
```

### <\<Unset>>
**WIP:** Need to ascertain `<<unset>>` within control flow macros.

You may also `<<unset>>` your variable to change it to `null`.
```
:: ExamplePassage
<<unset SpecialMonkeyVariable>>
```

### <\<if>>
You can use several control macros along with your variables to control which text to display in your passages.

For example:
```
:: Example Passage
Testing text5 - else if:
<<if truevar>>
    Base True.
<<elseif anothervar>>
    Else if true.
<<else>>
    Nothing was true.
<<endif>>
Postendif text.
```
This passage will automatically split into multiple passages on generation:
```
:: Generated Example Passage One [truevar true]
Testing text5 - else if:
Base True.
Postendif text.
```
```
:: Example Passage Passage Two [truevar false, anothervar true]
Testing text5 - else if:
Else if true.
Postendif text.
```
```
:: Example Passage Three [truevar false, anothervar false]
Testing text5 - else if:
Nothing was true.
Postendif text.
```
Based on the variables that have been set, Primitive will automatically send the reader to the correct version of the passage! This is the whole point of Primitive!



# Installation
## Local Install for [Tweego](https://www.motoslave.net/tweego/)
See [Tweego's Documentation](https://www.motoslave.net/tweego/docs/) for more information.

## Local Install for [Twine 2.x](https://github.com/klembot/twinejs/releases)
1. Download the current version of Primitive from the [Releases](https://github.com/leahiel/Primitive-StoryFormat/releases). 
2. Extract the archive to a safe location on your computer and make note of the path to it. Make sure to keep the files together if you move them out of the included directory.
3. Launch Twine 2.x.
4. Click on the `Formats` link in the Twine 2 sidebar.
5. In the dialog that opens, click on the `Add a New Format` tab.
6. Finally, paste a [file URL](https://en.wikipedia.org/wiki/File_URI_scheme) to the `format.js` file, based upon the path from step #2, into the textbox and click the `+Add` button.



# Acknowledgements
* To [Hituro](https://github.com/hituro) for guidance, suggestions, ambition, and more in the creation of Primitive.
* To Sophie Houlden's [WritingFantasy](https://sophiehoulden.com/twine/writingfantasy_guide.html) StoryFormat for inspiring this StoryFormat and the boundaries of this StoryFormat.
* To [TME](https://github.com/tmedwards) for specific help in regards to creating any StoryFormat, and as well as in the creation of Primitive.
* To [Greyelf](https://github.com/greyelf) for guidance in the creation of Primitive.
* To [MCD](https://github.com/mcdemarco) for guidance in the creation of Primitive.
* A special thank you to TME for creating [Tweego](https://www.motoslave.net/tweego/), which provides a CLI for authors to compile Twee documents.
* To TME's [SugarCube](https://www.motoslave.net/sugarcube/2/) StoryFormat for inspiration on Macros.
* And to the [Twine Specifications](https://github.com/iftechfoundation/twine-specs) for specificational reasons.
