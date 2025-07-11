import 'dart:io';
import 'package:flutter/material.dart';

void main() => runApp(MuseumApp());

class MuseumApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text("Museum VR Controller")),
        body: Center(
          child: Column(
            children: [
              ElevatedButton(
                onPressed: () => _startServer(),
                child: Text("Start Server"),
              ),
              ElevatedButton(
                onPressed: () => _startClient(),
                child: Text("Start Client"),
              ),
              ElevatedButton(
                onPressed: () => _openBrowser(),
                child: Text("Open in Browser"),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _startServer() async {
    await Process.start('python3', ['assets/server.py']);
  }

  Future<void> _startClient() async {
    await Process.start('python3', ['assets/client.py']);
  }

  Future<void> _openBrowser() async {
    await Process.run('xdg-open', ['http://127.0.0.1:9000']);
  }
}