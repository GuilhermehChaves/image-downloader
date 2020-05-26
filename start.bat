setlocal ENABLEDELAYEDEXPANSION
SET /P term= termo a pesquisar: 

set replacement=_
set term=%term: =!replacement!%

node src/index %term%
