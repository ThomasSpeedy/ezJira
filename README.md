# ezJira

**This add-on injects JavaScript into web pages. The `addons.mozilla.org` domain disallows this operation, so this add-on will not work properly when it's run on pages in the `addons.mozilla.org` domain.**

## Öffnet das JIRA mit dem angegebenen Ticket
ezJira (pronounced like easy JIRA) has been designed to give you an easier workflow with JIRA and other tools
Statt in der Adresszeile das Ticket aufzurufen, kannst du dies nun in Sekundenschnelle mit einem Klick (oder komplett mit der Tastatur) tun.
Tippe einfach die Ticket ID ein und bestätige deine Eigabe, um auf die JIRA Seite zu gelangen.

Alternativ kannst du auch über die Omnibox das Ticket aufrufen, hierzu reicht ein 'ezJira' und dann die Ticket ID.

Alternativ kannst du auch über die Omnibox das Ticket aufrufen, hierzu reicht ein 'ezJira' und dann copy 1, copy 2, .. bis copy 5

Du kannst zwischen "neuen" und "aktuellen" Tab als Standard wechseln.

Quick JIRA kommt mit den folgenden Funktionen
* Button für den aktuellen Tab
* Button für einen neuen Tab
* Button zum erneuten Öffnen des Tickets
* Tastenkombination (CTRL + SHIFT + K)
* Tastenkombinationen um selektierten Text im aktuellen (ALT + K) oder einem neuen Tab (ALT + SHIFT + K) zu öffnen
* Omnibox Funktion - Suche mit dem Befehl jira
* Optionsseite, um die JIRA Adresse und die Standard Aktion einzustellen
* Kontextmenü bei einem Rechtsklick, sofern Text selektiert wurde
* Komplett übersetzt ins Deutsche

## What it shows

* how to inject content scripts declaratively using manifest.json
* how to write to the [clipboard](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard)

## Note
* If the `copySelection` function was in a browser event `clipboardWrite` permissions would be required e.g.
```
"permissions": ["clipboardWrite"]
```
See [Interact with the clipboard](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard).
