

class Repo {
  final String name;
  final String description;
  final String url;

  Repo({required this.name, required this.description, required this.url});

  factory Repo.fromJson(Map<String, dynamic> json) {
    return Repo(
      name: json['name'],
      description: json['description'] ?? "No description",
      url: json['html_url'],
    );
  }
}
