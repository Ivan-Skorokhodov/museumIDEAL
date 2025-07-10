#!/bin/bash

gnome-terminal -- bash -c "./client.py; exec bash"
gnome-terminal -- bash -c "./server.py; exec bash"

sleep 2
xdg-open "http://127.0.0.1:9000"