- Main site where my MongoDB Atlas instance is
  - https://cloud.mongodb.com/

```powershell
npm install mongodb
```


# Setting up Atlas authentication

```powershell
npm install realm-web
```

https://www.mongodb.com/developer/products/atlas/email-password-authentication-react/

Their collection watching is not supported yet (`collection.watch()`) which makes it hard to do a collaborative map game, so I'll likely have to stick with firestore for this.