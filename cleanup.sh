#!/bin/bash

jpeginfo ./users/**/*.jpg | grep "Not a JPEG file" | egrep -o '.*\.jpg' | egrep -o '.*/[^\.]*' > jpegToPng.txt
jpeginfo ./users/**/*.jpg | grep "Empty" | egrep -o '.*\.jpg' | egrep -o '.*/[^\.]*' > delete.txt

cat jpegToPng.txt | while read line
do
  mv "$line.jpg" "$line.png"
done

cat delete.txt | while read line
do
  rm -rf "$line.jpg"
done

fdupes -rdN ./users/

rm -rf delete.txt
rm -rf jpegToPng.txt
