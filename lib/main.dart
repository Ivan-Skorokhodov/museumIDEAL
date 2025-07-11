import 'dart:io';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

void main() => runApp(MuseumApp());

class MuseumApp extends StatefulWidget {
  @override
  _MuseumAppState createState() => _MuseumAppState();
}

class _MuseumAppState extends State<MuseumApp> with WidgetsBindingObserver {
  Process? _serverProcess;
  bool _isServerRunning = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance?.addObserver(this);
  }

  @override
  void dispose() {
    _killServerProcess();
    WidgetsBinding.instance?.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.detached || state == AppLifecycleState.paused) {
      _killServerProcess();
    }
  }

  Future<void> _killServerProcess() async {
    if (_serverProcess != null) {
      _serverProcess!.kill();
      _serverProcess = null;
      setState(() {
        _isServerRunning = false;
      });
    }
  }

  Future<void> _startApp() async {
    try {
      if (Platform.isWindows) {
        _serverProcess = await Process.start('python', ['assets\\server.py']);
      } else {
        _serverProcess = await Process.start('python3', ['assets/server.py']);
      }

      setState(() {
        _isServerRunning = true;
      });

      await Future.delayed(Duration(seconds: 2));

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

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text("Museum VR Controller")),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: _isServerRunning ? null : _startApp,
                child: Text("Start Server and Open App in Browser"),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isServerRunning ? _killServerProcess : null,
                child: Text("Stop Server"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}