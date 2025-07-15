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
  Process? _clientProcess;
  bool _isServerRunning = false;
  bool _isClientRunning = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance?.addObserver(this);
  }

  @override
  void dispose() {
    _killServerProcess();
    _killClientProcess();
    WidgetsBinding.instance?.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.detached || state == AppLifecycleState.paused) {
      _killServerProcess();
      _killClientProcess();
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

  Future<void> _killClientProcess() async {
    if (_clientProcess != null) {
      _clientProcess!.kill();
      _clientProcess = null;
    }
  }

  Future<void> _startApp() async {
    try {
      final serverPath = Platform.isWindows
        ? 'assets\\server.exe'
        : 'assets/server';

      _serverProcess = await Process.start(serverPath, []);


      _serverProcess!.stdout
          .transform(SystemEncoding().decoder)
          .listen((data) => print('STDOUT: $data'));

      _serverProcess!.stderr
          .transform(SystemEncoding().decoder)
          .listen((data) => print('STDERR: $data'));

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
      print('Error starting server: $e');
    }
  }

  Future<void> _startClientProcess() async {
    try {
      final clientPath = Platform.isWindows
        ? 'assets\\client.exe'
        : 'assets/client';

      _clientProcess = await Process.start(clientPath, []);


      _clientProcess!.stdout
          .transform(SystemEncoding().decoder)
          .listen((data) => print('CLIENT STDOUT: $data'));

      _clientProcess!.stderr
          .transform(SystemEncoding().decoder)
          .listen((data) => print('CLIENT STDERR: $data'));

    } catch (e) {
      print('Error starting client: $e');
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
                onPressed: _isServerRunning ? null : _startClientProcess,
                child: Text("Start Client (detecting hand)"),
              ),
              SizedBox(height: 20),
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
