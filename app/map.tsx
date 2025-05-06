import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setPcPos, setSelected } from '../store/slices/gameSlice';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { colors } from '../theme/colors';

const TILE = 40;
const SIDEBAR = 120;
const INFOBAR = 90;
const { width: W, height: H } = Dimensions.get('window');
const CONTAINER_W = W - SIDEBAR;
const CONTAINER_H = H - INFOBAR;

interface Coor { row: number; col: number }

export default function MapScreen() {
  const dispatch = useDispatch();
  const { rows, cols, tiles, pcPos, selected } = useSelector((s: RootState) => s.game);

  /* ---------- path & distance ---------- */
  const [path, setPath]     = useState<Coor[]>([]);
  const [distance, setDist] = useState(0);

  const bresenham = (a: Coor, b: Coor) => {
    const out: Coor[]=[];
    let [x0,y0,x1,y1] = [a.col, a.row, b.col, b.row];
    const dx=Math.abs(x1-x0), dy=Math.abs(y1-y0);
    const sx=x0<x1?1:-1, sy=y0<y1?1:-1;
    let err=dx-dy;
    while(true){
      out.push({row:y0,col:x0});
      if(x0===x1&&y0===y1) break;
      const e2=2*err;
      if(e2>-dy){ err-=dy; x0+=sx; }
      if(e2< dx){ err+=dx; y0+=sy; }
    }
    return out;
  };

  useEffect(()=>{
    if(!selected){ setPath([]); setDist(0); return; }
    if(selected.row===pcPos.row && selected.col===pcPos.col){ setPath([]); setDist(0); return; }
    const p=bresenham(pcPos, selected);
    setPath(p);
    setDist(p.length-1);
  },[selected, pcPos]);

  /* ---------- camera ---------- */
  const MAP_W = cols*TILE, MAP_H = rows*TILE;
  const minX=-Math.max(0,MAP_W-CONTAINER_W), maxX=0;
  const minY=-Math.max(0,MAP_H-CONTAINER_H), maxY=0;
  const initX=Math.min(Math.max(-pcPos.col*TILE+CONTAINER_W/2-TILE/2,minX),maxX);
  const initY=Math.min(Math.max(-pcPos.row*TILE+CONTAINER_H/2-TILE/2,minY),maxY);

  const offsetX=useSharedValue(initX); const offsetY=useSharedValue(initY);
  const jsOffset=useRef({x:initX,y:initY});
  const [needRecentre,setNeedRecentre]=useState(false);

  const updateRecentre=(nx:number,ny:number)=>{
    jsOffset.current={x:nx,y:ny};
    const sx=pcPos.col*TILE+nx, sy=pcPos.row*TILE+ny;
    setNeedRecentre(sx<0||sx>=CONTAINER_W||sy<0||sy>=CONTAINER_H);
  };

  const startX=useSharedValue(0), startY=useSharedValue(0);
  const pan=useMemo(()=>Gesture.Pan()
    .onStart(()=>{ 'worklet'; startX.value=offsetX.value; startY.value=offsetY.value; })
    .onUpdate(e=>{ 'worklet';
      let nx=startX.value+e.translationX, ny=startY.value+e.translationY;
      if(nx<minX)nx=minX;if(nx>maxX)nx=maxX;if(ny<minY)ny=minY;if(ny>maxY)ny=maxY;
      offsetX.value=nx; offsetY.value=ny; runOnJS(updateRecentre)(nx,ny);
    }),[minX,maxX,minY,maxY]);

  const camStyle=useAnimatedStyle(()=>({transform:[
    {translateX:offsetX.value},{translateY:offsetY.value}]}));

  /* viewport for tap calc */
  const viewport=useRef({x:0,y:0});
  const onLayout=(e:LayoutChangeEvent)=>{ viewport.current={x:e.nativeEvent.layout.x,y:e.nativeEvent.layout.y}; };

  /* tap select */
  const onTap=(e:any)=>{
    const col=Math.floor((e.nativeEvent.pageX-viewport.current.x-jsOffset.current.x)/TILE);
    const row=Math.floor((e.nativeEvent.pageY-viewport.current.y-jsOffset.current.y)/TILE);
    if(col>=0&&col<cols&&row>=0&&row<rows) dispatch(setSelected({row,col}));
  };

  /* travel animation */
  const travelling=useRef(false);
  const travel=()=>{
    if(!selected||travelling.current) return;
    console.log('Squares crossed:', path);
    travelling.current=true;
    path.slice(1).forEach((pt,i)=>{
      setTimeout(()=>dispatch(setPcPos(pt)), i*120);
    });
    setTimeout(()=>{
      travelling.current=false;
      dispatch(setSelected(null));
    }, (path.length-1)*120);
  };

  const recenter=()=>{ offsetX.value=withTiming(initX); offsetY.value=withTiming(initY); updateRecentre(initX,initY); };

  const selectedKey = selected ? `${selected.row}-${selected.col}` : null;

  /* ---------- UI ---------- */
  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <Pressable style={styles.btn}><Text style={styles.btnTxt}>Character</Text></Pressable>
        <Pressable style={styles.btn}><Text style={styles.btnTxt}>Options</Text></Pressable>
      </View>

      <View style={styles.mapWrap} onLayout={onLayout}>
        <GestureDetector gesture={pan}>
          <Animated.View style={camStyle} onStartShouldSetResponder={()=>true} onResponderRelease={onTap}>
            <Svg width={MAP_W} height={MAP_H}>
              {tiles.map(t=>(
                <Rect key={t.id} x={t.col*TILE} y={t.row*TILE} width={TILE} height={TILE}
                  fill={t.terrain==='plains'?'#4b4':t.terrain==='forest'?'#264':'#886'}
                  stroke={selectedKey===t.id?colors.accentGold:colors.surface}
                  strokeWidth={selectedKey===t.id?3:0.5}
                  opacity={selectedKey===t.id?0.55:1}/>
              ))}
              {selected && path.length>1 && (
                <Line x1={pcPos.col*TILE+TILE/2} y1={pcPos.row*TILE+TILE/2}
                      x2={selected.col*TILE+TILE/2} y2={selected.row*TILE+TILE/2}
                      stroke={colors.accentGold} strokeWidth={2}/>
              )}
              <SvgText x={pcPos.col*TILE+TILE/2} y={pcPos.row*TILE+TILE*0.7}
                fill={colors.ivoryWhite} fontSize="16" fontWeight="700" textAnchor="middle">PC</SvgText>
            </Svg>
          </Animated.View>
        </GestureDetector>
        {needRecentre && <Pressable style={styles.recenterBtn} onPress={recenter}><Text style={styles.recenterTxt}>Center PC</Text></Pressable>}
      </View>

      <View style={styles.infobar}>
        {selected ? (
          <>
            <Text style={styles.infoTxt}>Row {selected.row} • Col {selected.col} • Dist {distance}</Text>
            {selected.row===pcPos.row && selected.col===pcPos.col ? (
              <Pressable style={styles.actionBtn}><Text style={styles.actionTxt}>Enter</Text></Pressable>
            ) : (
              <Pressable style={styles.actionBtn} onPress={travel}><Text style={styles.actionTxt}>Travel</Text></Pressable>
            )}
          </>
        ) : (
          <Text style={styles.infoTxt}>Tap a tile</Text>
        )}
      </View>
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  screen:{flex:1,flexDirection:'row',backgroundColor:colors.backgroundBase},
  sidebar:{width:SIDEBAR,backgroundColor:colors.surface,paddingVertical:20,alignItems:'center',gap:24},
  btn:{width:'90%',backgroundColor:colors.accentGold,paddingVertical:10,alignItems:'center'},
  btnTxt:{color:colors.backgroundBase,fontWeight:'700'},
  mapWrap:{width:CONTAINER_W,height:CONTAINER_H,overflow:'hidden',backgroundColor:colors.backgroundBase},
  recenterBtn:{position:'absolute',right:10,top:10,backgroundColor:colors.accentGold,paddingVertical:6,paddingHorizontal:12,borderRadius:4},
  recenterTxt:{color:colors.backgroundBase,fontWeight:'700'},
  infobar:{position:'absolute',bottom:0,left:SIDEBAR,width:CONTAINER_W,height:INFOBAR,backgroundColor:colors.surface,justifyContent:'center',alignItems:'center',gap:8},
  infoTxt:{color:colors.ivoryWhite},
  actionBtn:{backgroundColor:colors.accentGold,paddingVertical:6,paddingHorizontal:14,borderRadius:4},
  actionTxt:{color:colors.backgroundBase,fontWeight:'700'},
});
