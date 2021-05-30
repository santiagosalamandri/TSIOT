function testSitio1() {
   EXPECTED='    <title>Sitio de prueba</title>'
   RESULT=$( wget --no-check-certificate -O- https://sitio1 2>/dev/null | grep title )
   assertEquals "$EXPECTED" "$RESULT"
}
function testSitio2() {
   EXPECTED='    <title>Sitio de prueba</title>'
   RESULT=$( wget --no-check-certificate -O- https://sitio1 2>/dev/null | grep title )
   assertEquals "$EXPECTED" "$RESULT"
}


function testHitcountOnInit() {
   EXPECTED='<div id="count">-1</div>  '
   RESULT=$( wget --no-check-certificate -O- https://sensor/hitcount 2>/dev/null | grep div )
   assertEquals "$EXPECTED" "$RESULT"
}
function testSitio1NoHits() {
   EXPECTED='<div id="count">0</div>  '
   wget --no-check-certificate -O- https://sensor/reset 2>/dev/null >/dev/null
   wget --no-check-certificate -O- https://sitio1 2>/dev/null >/dev/null
   RESUL=$( wget --no-check-certificate -O- https://sensor/hitcount 2>/dev/null | grep div )
   assertEquals "$EXPECTED" "$RESULT"
}


function testHitcountPostReset() {
   EXPECTED='<div id="count">0</div>  '
   wget --no-check-certificate -O- https://sensor/reset 2>/dev/null >/dev/null
   RESULT=$( wget --no-check-certificate -O- https://sensor/hitcount 2>/dev/null | grep div )
   assertEquals "$EXPECTED" "$RESULT"
}


. shunit2
