import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:myapp/repo.dart';

void main() async {
  runApp(const MaterialApp(
    home: MyApp(),
  ));
}

Future<List<Repo>> fetchRepositories(String username) async {
  Uri githubUrl = Uri.https(
      "api.github.com", "/users/$username/repos", {"sort": "created"});
  var response = await get(githubUrl);

  if (response.statusCode == 200) {
    var data = jsonDecode(response.body) as List;
    List<Repo> repositories = data.map((r) => Repo.fromJson(r)).toList();
    return repositories;
  } else {
    throw Exception('Failed to load repositories');
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My repo's"),
      ),
      body: FutureBuilder(
        future: fetchRepositories("dron3flyv3r"),
        builder: (BuildContext context, AsyncSnapshot<List<Repo>> snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Column(
              children: const [
                Text("Fetching data"),
                CircularProgressIndicator(),
              ],
            );
          } else {
            if (snapshot.hasError) {
              return const Text("There was an Error");
            } else {
              return ListView.builder(
                itemCount: snapshot.data?.length,
                itemBuilder: ((context, index) {
                  Repo repo = snapshot.data![index];
                  return Container(
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.blue,
                    ),
                    padding: const EdgeInsets.all(25),
                    child: Column(
                      children: [
                        Row(children: [const Text("Name: "), Text(repo.name)]),
                        Row(children: [const Text("Url: "), Text(repo.url)]),
                        Row(children: [
                          const Text("Description: "),
                          Text(repo.description)
                        ]),
                      ],
                    ),
                  );
                }),
              );
            }
          }
        },
      ),
    );
  }
}
