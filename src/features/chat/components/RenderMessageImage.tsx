import React, { memo, useEffect, useMemo, useState } from "react";
import { Image, View, ActivityIndicator, StyleSheet } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

export const RenderMessageImage = memo(({ currentMessage }: { currentMessage: IMessage }) => {
  const uri = currentMessage?.image;
  const [size, setSize] = useState({ w: 200, h: 200 });
  const [loading, setLoading] = useState(true);

  const validUri = useMemo(() => {
    if (!uri) return "";
    if (uri.startsWith("data:image")) return uri;
    return `data:image/jpeg;base64,${uri}`;
  }, [uri]);

  useEffect(() => {
    if (!validUri) return;
    let isMounted = true;

    Image.getSize(
      validUri,
      (width, height) => {
        if (!isMounted) return;
        const maxWidth = 250;
        const ratio = width / height;
        const imageWidth = Math.min(width, maxWidth);
        const imageHeight = imageWidth / ratio;
        setSize({ w: imageWidth, h: imageHeight });
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => {
      isMounted = false;
    };
  }, [validUri]);

  if (loading)
    return (
      <View style={[styles.imageContainer, { width: size.w, height: size.h }]}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );

  return (
    <View style={[styles.imageContainer, { width: size.w, height: size.h }]}>
      <Image
        source={{ uri: validUri }}
        style={[styles.image, { width: size.w, height: size.h }]}
        resizeMode="cover"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 4,
    marginHorizontal: 6,
    backgroundColor: "#eee",
  },
  image: {
    borderRadius: 10,
  },
});
