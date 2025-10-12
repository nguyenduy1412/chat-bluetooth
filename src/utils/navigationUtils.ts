
import {
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native'
import { RootNavigatorParamList } from '../types/navigation-type'


export const navigationRef =
  createNavigationContainerRef<RootNavigatorParamList>()

export function navigate(
  name: keyof RootNavigatorParamList,
  params?: RootNavigatorParamList[keyof RootNavigatorParamList],
) {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name, params)
  }
}

export function replace(
  name: keyof RootNavigatorParamList,
  params?: RootNavigatorParamList[keyof RootNavigatorParamList],
) {
  navigationRef.dispatch(StackActions.replace(name, params))
}

export function popToTop() {
  navigationRef.dispatch(StackActions.popToTop())
}

export function pop(position = 1) {
  navigationRef.dispatch(StackActions.pop(position))
}

export function goBack() {
  navigationRef.goBack()
}

export function setRoot(name: keyof RootNavigatorParamList, params = {}) {
  navigationRef.reset({
    index: 0,
    routes: [
      {
        name,
        params,
      },
    ],
  })
}

export function getCurrentRoute() {
  return navigationRef.getCurrentRoute()?.name
}
