const Sauce = require('../models/Sauce');
const fs = require('fs');
const { error } = require('console');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.likes = 0;
    sauce.dislikes = 0;
    sauce.usersLiked = [];
    sauce.usersDisliked = [];
    sauce.save()
        .then(() => res.status(201).json({ message: 'La sauce a bien été ajoutée !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifyLikes = (req, res, next) => {
    const likeValue = req.body.like;
    const user = req.body.userId;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch (likeValue) {
                case 1:
                    try {
                        if (!sauce.usersLiked.includes(user)) {
                            Sauce.updateOne(
                                { _id: req.params.id },
                                {
                                    $push: { usersLiked: user },
                                    $inc: { likes: +1 }
                                }
                            )
                                .then(() => res.status(200).json({ message: "Sauce likée !" }))
                                .catch(error => res.status(500).json({ error }));
                        };
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case -1:
                    try {
                        if (!sauce.usersDisliked.includes(user)) {
                            Sauce.updateOne(
                                { _id: req.params.id },
                                {
                                    $push: { usersDisliked: user },
                                    $inc: { dislikes: +1 }
                                }
                            )
                                .then(() => res.status(200).json({ message: "Sauce dislikée !" }))
                                .catch(error => res.status(500).json({ error }));
                        };
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 0:
                    try {
                        if (sauce.usersLiked.includes(user)) {
                            Sauce.updateOne(
                                { _id: req.params.id },
                                {
                                    $pull: { usersLiked: user },
                                    $inc: { likes: -1 }
                                }
                            )
                                .then(() => res.status(200).json({ message: "Vote annulé !" }))
                                .catch(error => res.status(500).json({ error }));
                        } else if (sauce.usersDisliked.includes(user)) {
                            Sauce.updateOne(
                                { _id: req.params.id },
                                {
                                    $pull: { usersDisliked: user },
                                    $inc: { dislikes: -1 }
                                }
                            )
                                .then(() => res.status(200).json({ message: "Vote annulé !" }))
                                .catch(error => res.status(500).json({ error }));
                        };
                    } catch (error) {
                        console.log(error);
                    }
                    break;
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};