import 'dart:io';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

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
                onPressed: _startApp,
                child: Text("Start Server and Open App in Browser"),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _startApp() async {
    try {
      if (Platform.isWindows) {
        await Process.start('python', ['assets\\server.py']);
      } else {
        await Process.start('python3', ['assets/server.py']);
      }

      final url = Uri.parse('http://127.0.0.1:9000');
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        throw 'Could not launch $url';
      }
    } catch (e) {
      print('Error: $e');
      }
  }
}