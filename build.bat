SET outputfile=out.html

ECHO OFF
ECHO Building Primitive StoryFormat
ECHO ================================================
cd primitive
CALL node build.js

ECHO:
ECHO Building Test Story
ECHO ================================================
cd ..
CALL tweego teststorysrc -o %outputfile%
ECHO Test Story Complete
