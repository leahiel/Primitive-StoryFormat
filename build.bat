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
CALL tweego STORYSOURCE/hituro/The_Garden_of_Earthly_Regrets -o %outputfile%
ECHO Test Story Complete
