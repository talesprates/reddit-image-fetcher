#!/bin/bash

RANKS=(zero-stars-users one-stars-users two-stars-users three-stars-users four-stars-users five-stars-users)

rm -rf users-ranked/*

for star in {2..5..1}; do
	mkdir ${PWD}/users-ranked/${RANKS[$star]}
	USERS=$(mongo reddit-images-db --eval "db.users.find({ rating: ${star} }).forEach(printjson)" | sed 1,2d | jq -r '._id')
	for user in ${USERS[@]}; do 
		ln -s ${PWD}/users/${user} ${PWD}/users-ranked/${RANKS[$star]}
	done
done
