import Foundation
import Vision
import AppKit
let root=URL(fileURLWithPath:CommandLine.arguments[1])
let patterns:[(String,String)]=[
 ("uuid","[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"),
 ("hex_identifier","(?<![A-Za-z0-9])[0-9a-fA-F]{32,}(?![A-Za-z0-9])"),
 ("credential_prefix","(?:sk-[A-Za-z0-9_-]{12,}|eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]+|Bearer\\s+[A-Za-z0-9._-]{12,})"),
 ("ipv4","(?:[0-9]{1,3}\\.){3}[0-9]{1,3}"),
 ("sensitive_label","(?i)(api[ _-]?key|access[ _-]?token|refresh[ _-]?token|client[ _-]?secret|vault[ _-]?(?:token|role)|password)")]
var records:[[String:Any]]=[]
for file in try FileManager.default.contentsOfDirectory(at:root,includingPropertiesForKeys:nil).filter({$0.pathExtension=="png"}).sorted(by:{$0.lastPathComponent<$1.lastPathComponent}) {
 guard let img=NSImage(contentsOf:file),let cg=img.cgImage(forProposedRect:nil,context:nil,hints:nil) else {continue}
 let request=VNRecognizeTextRequest();request.recognitionLevel = .accurate;request.recognitionLanguages=["en-US","zh-Hans"];request.usesLanguageCorrection=false
 try VNImageRequestHandler(cgImage:cg).perform([request])
 var hits:[[String:Any]]=[]
 for observation in request.results ?? [] {
  guard let text=observation.topCandidates(1).first?.string else {continue}
  let compact=text.replacingOccurrences(of:" ",with:"")
  for (kind,pattern) in patterns {
   if text.range(of:pattern,options:.regularExpression) != nil || (kind=="hex_identifier" && compact.range(of:pattern,options:.regularExpression) != nil) {
    let b=observation.boundingBox
    hits.append(["kind":kind,"text":text,"bbox":[b.minX,b.minY,b.width,b.height]])
   }
  }
 }
 records.append(["file":file.lastPathComponent,"width":cg.width,"height":cg.height,"hits":hits])
 print("\(file.lastPathComponent): \(hits.count) flagged regions")
 fflush(stdout)
}
let out=FileManager.default.temporaryDirectory.appendingPathComponent("hymio-doc-image-audit.json")
try JSONSerialization.data(withJSONObject:records,options:[.prettyPrinted,.sortedKeys]).write(to:out)
try FileManager.default.setAttributes([.posixPermissions:0o600],ofItemAtPath:out.path)

if records.contains(where: { !($0["hits"] as! [[String:Any]]).isEmpty }) { exit(1) }
